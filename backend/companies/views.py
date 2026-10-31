from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Company
from .serializers import CompanySerializer
from candidates.permissions import IsRecruiter


class CompanyView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsRecruiter()]

    def get_object(self):
        company, _ = Company.objects.get_or_create(recruiter=self.request.user, defaults={'name': ''})
        return company

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'company': self.get_serializer(instance).data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(recruiter=request.user)
        return Response({'success': True, 'company': serializer.data})


class CompanyDetailView(generics.RetrieveAPIView):
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    queryset = Company.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'company': self.get_serializer(instance).data})
