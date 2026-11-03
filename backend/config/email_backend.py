import sys
from django.core.mail.backends.console import EmailBackend as BaseConsoleEmailBackend


class SafeConsoleEmailBackend(BaseConsoleEmailBackend):
    """
    Console email backend that safely handles Windows cp1252 stdout terminals
    without crashing on emojis or unicode characters.
    """
    def write_message(self, message):
        msg = message.message()
        msg_data = msg.as_bytes()
        charset = message.encoding or 'utf-8'
        text = msg_data.decode(charset, errors='replace')
        try:
            self.stream.write(text)
            self.stream.flush()
        except (UnicodeEncodeError, Exception):
            encoding = getattr(self.stream, 'encoding', 'ascii') or 'ascii'
            safe_text = text.encode(encoding, errors='backslashreplace').decode(encoding, errors='ignore')
            self.stream.write(safe_text)
            self.stream.flush()

