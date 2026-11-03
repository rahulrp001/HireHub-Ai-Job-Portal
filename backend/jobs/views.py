from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import Job, SavedJob
from .serializers import JobSerializer, JobCreateSerializer
from candidates.permissions import IsRecruiter, IsCandidate


class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related('company', 'recruiter')
        q = self.request.query_params.get('q')
        job_type = self.request.query_params.get('job_type')
        work_mode = self.request.query_params.get('work_mode')
        location = self.request.query_params.get('location')
        exp_min = self.request.query_params.get('exp_min')
        exp_max = self.request.query_params.get('exp_max')

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) |
                           Q(company__name__icontains=q) | Q(location__icontains=q))
        if job_type:
            qs = qs.filter(job_type=job_type)
        if work_mode:
            qs = qs.filter(work_mode=work_mode)
        if location:
            qs = qs.filter(location__icontains=location)
        if exp_min:
            qs = qs.filter(experience_min__gte=exp_min)
        if exp_max:
            qs = qs.filter(experience_max__lte=exp_max)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)


class JobDetailView(generics.RetrieveAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.objects.select_related('company', 'recruiter')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response({'success': True, 'job': serializer.data})


class RecruiterJobListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobSerializer

    def get_queryset(self):
        return (
            Job.objects.filter(recruiter=self.request.user)
            .select_related('company', 'recruiter')
            .annotate(app_count=Count('applications'))
            .order_by('-created_at')
        )

    def list(self, request, *args, **kwargs):
        # Ultra fast query: values() bypasses N+1 serialization overhead for thousands of jobs
        user = request.user
        company = getattr(user, 'company', None)
        company_data = None
        if company:
            from companies.serializers import CompanySerializer
            company_data = CompanySerializer(company).data

        jobs_qs = (
            Job.objects.filter(recruiter=user)
            .annotate(app_count=Count('applications'))
            .order_by('-created_at')
            .values(
                'id', 'title', 'status', 'location', 'job_type', 'work_mode',
                'salary_min', 'salary_max', 'experience_min', 'experience_max',
                'required_skills', 'preferred_skills', 'education_required',
                'application_deadline', 'created_at', 'updated_at',
                'app_count', 'company_id', 'description', 'requirements', 'responsibilities'
            )
        )

        recruiter_name = user.full_name or f"{user.first_name} {user.last_name}".strip()
        jobs_list = []
        for j in jobs_qs:
            app_count = j.pop('app_count', 0)
            company_id = j.pop('company_id', None)
            j['applications_count'] = app_count
            j['recruiter_name'] = recruiter_name
            j['company'] = company_id
            j['company_detail'] = company_data
            j['is_saved'] = False
            jobs_list.append(j)

        return Response({'success': True, 'jobs': jobs_list})

    def create(self, request, *args, **kwargs):
        serializer = JobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = getattr(request.user, 'company', None)
        job = serializer.save(recruiter=request.user, company=company)
        return Response({'success': True, 'job': JobSerializer(job, context={'request': request}).data},
                        status=status.HTTP_201_CREATED)


class RecruiterJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    serializer_class = JobCreateSerializer

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'job': JobSerializer(instance, context={'request': request}).data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        return Response({'success': True, 'job': JobSerializer(job, context={'request': request}).data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'success': True, 'message': 'Job deleted'})


class SaveJobView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk, status=Job.Status.PUBLISHED)
        saved, created = SavedJob.objects.get_or_create(candidate=request.user, job=job)
        if not created:
            saved.delete()
            return Response({'success': True, 'saved': False, 'message': 'Job unsaved'})
        return Response({'success': True, 'saved': True, 'message': 'Job saved'})


class SavedJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Job.objects.filter(saved_by__candidate=self.request.user).select_related('company')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True, context={'request': request})
        return Response({'success': True, 'saved_jobs': serializer.data})


class SeedBulkJobsView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def post(self, request):
        count = int(request.data.get('count', 1000))
        count = max(10, min(count, 2000))
        
        from .models import Job
        from companies.models import Company
        import random
        from datetime import date, timedelta

        TITLES = [
            ("Senior Full Stack Developer", ["React", "Node.js", "TypeScript", "PostgreSQL"], ["GraphQL", "Docker"]),
            ("Frontend React Specialist", ["React", "TypeScript", "Tailwind CSS", "Redux"], ["Next.js", "Jest"]),
            ("Backend Engineer (Python/Django)", ["Python", "Django", "PostgreSQL", "REST API"], ["Celery", "Redis"]),
            ("Cloud DevOps Engineer", ["AWS", "Docker", "Kubernetes", "Terraform"], ["CI/CD", "Linux"]),
            ("AI & Machine Learning Engineer", ["Python", "Machine Learning", "PyTorch", "NLP"], ["LLMs", "FastAPI"]),
            ("Data Scientist", ["Python", "Data Analysis", "SQL", "Pandas", "Scikit-learn"], ["Tableau", "Statistics"]),
            ("Mobile App Developer (Flutter)", ["Flutter", "Dart", "REST API", "Android Development"], ["iOS Development", "Firebase"]),
            ("Mobile Engineer (React Native)", ["React Native", "JavaScript", "Redux", "REST API"], ["TypeScript", "Native Modules"]),
            ("Senior Java Microservices Architect", ["Java", "Spring Boot", "Microservices", "MySQL"], ["Kafka", "Docker"]),
            ("Cybersecurity Analyst", ["Cybersecurity", "Networking", "Linux", "Ethical Hacking"], ["OWASP", "SIEM"]),
            ("UI/UX Product Designer", ["Figma", "UI/UX Design", "Wireframing", "User Research"], ["Prototyping", "Design Systems"]),
            ("Product Manager (B2B SaaS)", ["Product Management", "Agile", "SQL", "Scrum"], ["JIRA", "Data Analysis"]),
            ("QA Automation Engineer", ["Selenium", "Python", "Unit Testing", "Postman"], ["Cypress", "JMeter"]),
            ("Data Platform Engineer", ["Python", "SQL", "AWS", "Data Analysis"], ["PySpark", "Kafka", "Airflow"]),
            ("Site Reliability Engineer (SRE)", ["Linux", "Kubernetes", "AWS", "CI/CD"], ["Prometheus", "Grafana"]),
            ("Golang Systems Engineer", ["Go", "Microservices", "Docker", "PostgreSQL"], ["Kubernetes", "gRPC"]),
            ("Full Stack MERN Developer", ["MongoDB", "Express.js", "React.js", "Node.js"], ["TypeScript", "Tailwind CSS"]),
            ("Generative AI & LLM Researcher", ["Python", "NLP", "Machine Learning", "FastAPI"], ["PyTorch", "LangChain"]),
            ("Embedded Software Developer", ["C", "C++", "Linux", "IoT"], ["RTOS", "Networking"]),
            ("Database Administrator (DBA)", ["PostgreSQL", "MySQL", "SQL", "Linux"], ["Performance Tuning", "AWS RDS"]),
        ]

        LOCATIONS = [
            "Bangalore, India", "Mumbai, India", "Delhi, India", "Noida, India",
            "Gurugram, India", "Hyderabad, India", "Pune, India", "Chennai, India",
            "Kolkata, India", "Ahmedabad, India", "Jaipur, India", "Lucknow, India",
            "Chandigarh, India", "Indore, India", "Kochi, India", "Remote, India",
            "Coimbatore, India", "Bhubaneswar, India", "Nagpur, India", "Surat, India"
        ]

        JOB_TYPES = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "CONTRACT", "INTERNSHIP"]
        WORK_MODES = ["HYBRID", "ON_SITE", "REMOTE"]
        
        company = getattr(request.user, 'company', None)
        if not company:
            company = Company.objects.first()

        deadline = date.today() + timedelta(days=90)
        jobs_to_create = []

        for i in range(count):
            t_spec = TITLES[i % len(TITLES)]
            loc = LOCATIONS[(i // len(TITLES) + i) % len(LOCATIONS)]
            j_type = JOB_TYPES[i % len(JOB_TYPES)]
            w_mode = WORK_MODES[(i * 3 + 1) % len(WORK_MODES)]
            
            exp_min = (i % 6)
            exp_max = exp_min + random.randint(2, 5)
            sal_min = 500000 + (exp_min * 200000) + ((i % 5) * 50000)
            sal_max = sal_min + random.randint(300000, 1000000)

            title = t_spec[0]
            if i >= len(TITLES):
                prefixes = ["Senior", "Lead", "Associate", "Staff", "Principal", "Junior"]
                prefix = prefixes[(i // len(TITLES)) % len(prefixes)]
                if not title.startswith(("Senior", "Lead", "Staff", "Principal")):
                    title = f"{prefix} {title}"

            job = Job(
                recruiter=request.user,
                company=company,
                title=title,
                description=f"Join our fast-growing technical team in {loc} as a {title}. You will design, build, and deploy production-scale systems, collaborate with cross-functional teams, and solve challenging engineering problems.",
                requirements=f"{exp_min}+ years of hands-on experience with modern technical stacks, clean code architecture, and high-performance applications.",
                responsibilities="Develop modular features, participate in code reviews, optimize system performance, and maintain documentation.",
                required_skills=t_spec[1],
                preferred_skills=t_spec[2],
                location=loc,
                job_type=j_type,
                work_mode=w_mode,
                salary_min=sal_min,
                salary_max=sal_max,
                experience_min=exp_min,
                experience_max=exp_max,
                education_required="Bachelor's / Master's degree in CS, IT, Engineering or Equivalent",
                application_deadline=deadline,
                status=Job.Status.PUBLISHED
            )
            jobs_to_create.append(job)

        Job.objects.bulk_create(jobs_to_create, batch_size=500)
        return Response({
            'success': True,
            'count': len(jobs_to_create),
            'message': f'{len(jobs_to_create)} active jobs seeded successfully!'
        })
