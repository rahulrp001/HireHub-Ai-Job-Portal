import os
import logging
from datetime import datetime
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from notifications.models import Notification

logger = logging.getLogger(__name__)

# Ensure email_logs folder exists for audit/development verification
LOGS_DIR = os.path.join(settings.BASE_DIR, 'email_logs')
os.makedirs(LOGS_DIR, exist_ok=True)
AUDIT_LOG_FILE = os.path.join(LOGS_DIR, 'sent_emails.log')


def format_interview_datetime(dt):
    if not dt:
        return "To be coordinated by recruiter"
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except Exception:
            return dt
    try:
        return dt.strftime("%A, %d %b %Y at %I:%M %p (IST)")
    except Exception:
        return str(dt)


def send_candidate_status_email(application, custom_message=""):
    """
    Sends a rich, responsive email and in-app notification to the candidate
    when their application status is updated (SHORTLISTED, INTERVIEW, SELECTED, etc.).
    """
    candidate = application.candidate
    job = application.job
    company = getattr(job, 'company', None)
    company_name = company.name if company else "HireHub Partner Company"
    recruiter = job.recruiter
    status = application.status

    candidate_email = candidate.email
    candidate_name = candidate.first_name or candidate.full_name or "Candidate"

    interview_date_str = format_interview_datetime(application.interview_date)
    is_virtual = application.interview_mode == 'VIRTUAL'
    mode_label = "Virtual Video Conference" if is_virtual else "In-Person / Office Interview"
    location_label = "Meeting Link (Google Meet / Zoom)" if is_virtual else "Office Venue Address"
    location_val = application.interview_location or (
        "https://meet.google.com/hirehub-interview" if is_virtual else (company.location if company else "Company HQ")
    )
    round_name = application.interview_round or "Technical & Fitment Round"
    notes = application.interview_notes or custom_message or "Please be prepared 5-10 minutes prior to scheduled time."

    # Subject line & Content based on status
    if status == 'SELECTED':
        subject = f"🎉 Job Offer Confirmed: Selection for {job.title} at {company_name}"
        hero_tag = "🎉 JOB OFFER CONFIRMED"
        hero_title = f"Congratulations, {candidate_name}!"
        hero_subtitle = f"Your job selection for <strong>{job.title}</strong> at <strong>{company_name}</strong> has been officially confirmed!"
        badge_color = "#10b981"
        action_text = "View Selection Details"
        action_url = "http://localhost:5173/candidate/applications"
        notif_title = f"🎉 Job Offer Confirmed: {job.title}!"
        notif_msg = f"Congratulations! You have been SELECTED for {job.title} at {company_name}. Please check your email for details."

    elif status == 'INTERVIEW':
        subject = f"📅 Interview Scheduled: {job.title} at {company_name} [{mode_label}]"
        hero_tag = "📅 INTERVIEW SCHEDULED"
        hero_title = "You're Invited for an Interview!"
        hero_subtitle = f"The hiring team at <strong>{company_name}</strong> was impressed by your profile and has scheduled your interview for <strong>{job.title}</strong>."
        badge_color = "#2563eb"
        action_text = "Join Video Interview" if is_virtual else "View Office Location on Map"
        action_url = location_val if (is_virtual and location_val.startswith('http')) else "http://localhost:5173/candidate/applications"
        notif_title = f"📅 Interview Scheduled: {job.title} ({'Virtual' if is_virtual else 'In-Person'})"
        notif_msg = f"Your interview for {job.title} is scheduled for {interview_date_str}. Mode: {mode_label}."

    elif status == 'SHORTLISTED':
        subject = f"⭐ Application Shortlisted: {job.title} at {company_name}"
        hero_tag = "⭐ PROFILE SHORTLISTED"
        hero_title = "Great News! Your Application is Shortlisted"
        hero_subtitle = f"Congratulations! Your application for <strong>{job.title}</strong> at <strong>{company_name}</strong> has been shortlisted for the next stages."
        badge_color = "#9333ea"
        action_text = "Track Application Status"
        action_url = "http://localhost:5173/candidate/applications"
        notif_title = f"⭐ Application Shortlisted: {job.title}"
        notif_msg = f"Your application for {job.title} at {company_name} has been shortlisted by the recruiter!"

    elif status == 'REJECTED':
        subject = f"Update on your application for {job.title} at {company_name}"
        hero_tag = "APPLICATION UPDATE"
        hero_title = "Application Status Update"
        hero_subtitle = f"Thank you for your interest in the <strong>{job.title}</strong> role at <strong>{company_name}</strong>."
        badge_color = "#ef4444"
        action_text = "Browse More Opportunities"
        action_url = "http://localhost:5173/jobs"
        notif_title = f"Application Update: {job.title}"
        notif_msg = f"Thank you for interviewing for {job.title}. The recruiter has moved forward with another candidate."
    else:
        subject = f"Status Update: {job.title} at {company_name}"
        hero_tag = "APPLICATION STATUS"
        hero_title = f"Status: {status.replace('_', ' ').title()}"
        hero_subtitle = f"There is an update on your application for <strong>{job.title}</strong> at <strong>{company_name}</strong>."
        badge_color = "#2563eb"
        action_text = "View Application"
        action_url = "http://localhost:5173/candidate/applications"
        notif_title = f"Status Update: {job.title}"
        notif_msg = f"Your application status for {job.title} is now {status}."

    # Build Interview Details Card HTML (if INTERVIEW or date is present)
    interview_section_html = ""
    if status in ['INTERVIEW', 'SHORTLISTED'] and application.interview_date:
        interview_section_html = f"""
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="background-color: {'#eff6ff' if is_virtual else '#f0fdf4'}; color: {'#1d4ed8' if is_virtual else '#15803d'}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid {'#bfdbfe' if is_virtual else '#bbf7d0'}; text-transform: uppercase;">
                    {'💻 ' + mode_label if is_virtual else '🏢 ' + mode_label}
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">📅 Date & Time:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{interview_date_str}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">🎯 Round:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{round_name}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">📍 {location_label}:</td>
                    <td style="padding: 6px 0; color: #2563eb; font-weight: 600; word-break: break-all;">
                        {'<a href="' + location_val + '" style="color: #2563eb; text-decoration: underline;" target="_blank">' + location_val + '</a>' if location_val.startswith('http') else location_val}
                    </td>
                </tr>
                {f'''
                <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">📝 Instructions:</td>
                    <td style="padding: 6px 0; color: #334155; line-height: 1.5;">{notes}</td>
                </tr>
                ''' if notes else ''}
            </table>
        </div>
        """
    elif status == 'SELECTED':
        interview_section_html = f"""
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 22px; margin: 24px 0;">
            <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px; font-weight: 800;">🎉 Congratulations on Your Job Selection!</h3>
            <p style="color: #15803d; font-size: 13px; margin: 0 0 12px 0; line-height: 1.6;">
                The hiring team at <strong>{company_name}</strong> has confirmed your offer for <strong>{job.title}</strong>. 
                Our HR operations team will be sending you your formal offer package, compensation breakdown, and onboarding timeline shortly.
            </p>
            {f'''
            <div style="background: white; border-left: 4px solid #16a34a; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #1e293b; margin-top: 10px;">
                <strong>Note from Hiring Manager:</strong> {notes}
            </div>
            ''' if notes else ''}
        </div>
        """

    # Responsive HTML Template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 10px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0a1f44 0%, #1e3a8a 50%, #2563eb 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 12px;">
                Hire<span style="color: #60a5fa;">Hub</span>
            </div>
            <span style="display: inline-block; background-color: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.8px;">
                {hero_tag}
            </span>
            <h1 style="font-size: 24px; font-weight: 800; margin: 16px 0 6px 0; color: #ffffff; line-height: 1.3;">
                {hero_title}
            </h1>
            <p style="font-size: 14px; color: #dbeafe; margin: 0; line-height: 1.5;">
                {hero_subtitle}
            </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px;">
            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
                Dear <strong>{candidate_name}</strong>,
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                We are writing to provide you an official update regarding your application for the <strong>{job.title}</strong> role at <strong>{company_name}</strong>.
            </p>

            <!-- Job Info Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 20px 0;">
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 4px 0; width: 110px;">Position:</td>
                        <td style="color: #0f172a; font-weight: 700; padding: 4px 0;">{job.title}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Company:</td>
                        <td style="color: #0f172a; font-weight: 700; padding: 4px 0;">{company_name}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Location:</td>
                        <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">{job.location or 'Remote'} • {job.work_mode or 'Full Time'}</td>
                    </tr>
                    {f'''
                    <tr>
                        <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Salary Range:</td>
                        <td style="color: #15803d; font-weight: 700; padding: 4px 0;">₹{int(job.salary_min):,} - ₹{int(job.salary_max):,} / year</td>
                    </tr>
                    ''' if job.salary_min and job.salary_max else ''}
                </table>
            </div>

            <!-- Interview or Selection Details Section -->
            {interview_section_html}

            <!-- Action CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{action_url}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                    {action_text} &rarr;
                </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                <strong>Hiring Contact:</strong> {recruiter.full_name or 'Talent Acquisition Team'} ({recruiter.email})<br />
                Have questions or need to reschedule? Please reply directly to this email or communicate via the HireHub messaging tab.
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            This email was sent to {candidate_email} regarding your job application on HireHub Portal.<br />
            &copy; {datetime.now().year} HireHub Technologies Inc. All rights reserved.
        </div>
    </div>
</body>
</html>
"""

    text_content = strip_tags(html_content)

    # 1. Create In-App Notification in DB
    try:
        Notification.objects.create(
            user=candidate,
            title=notif_title,
            message=notif_msg,
            notification_type=Notification.Type.STATUS_CHANGE
        )
    except Exception as e:
        logger.warning(f"Failed to create notification: {e}")

    # 2. Send Email
    email_sent = False
    error_message = None

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'HireHub <careers@hirehub.in>')
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[candidate_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        email_sent = True
        logger.info(f"Email successfully dispatched to {candidate_email} for status {status}")
    except Exception as e:
        error_message = str(e)
        logger.error(f"Email send failure to {candidate_email}: {e}")

    # 3. Log to audit file for local verification
    timestamp = datetime.now().isoformat()
    log_entry = f"""
================================================================================
TIME: {timestamp}
TO: {candidate_email} ({candidate_name})
SUBJECT: {subject}
STATUS: {status}
JOB: {job.title} | COMPANY: {company_name}
INTERVIEW MODE: {mode_label}
INTERVIEW DATE: {interview_date_str}
VENUE / LINK: {location_val}
EMAIL SENT STATUS: {'SUCCESS' if email_sent else f'FAILED ({error_message})'}
================================================================================
"""
    try:
        with open(AUDIT_LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    except Exception:
        pass

    return {
        "success": True,
        "email_sent": email_sent,
        "error": error_message,
        "candidate_email": candidate_email,
        "subject": subject,
        "status": status,
        "interview_mode": mode_label,
        "interview_date": interview_date_str,
        "interview_location": location_val
    }

