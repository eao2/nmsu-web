import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface AttendanceEmailProps {
  clubTitle: string;
  status: string;
  date: any;
}

const statusMap: Record<string, string> = {
  PRESENT: 'Ирсэн',
  LATE: 'Хоцорсон',
  SICK: 'Өвчтэй',
  EXCUSED: 'Чөлөө авсан',
  ABSENT: 'Тасалсан',
};

export const AttendanceEmail = ({ clubTitle, status, date }: AttendanceEmailProps) => (
  <Html>
    <Head />
    <Preview>Ирц бүртгэгдлээ - {clubTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <div style={logo}></div>
        </div>
        <Heading style={h1}>Ирц бүртгэгдлээ</Heading>
        <Text style={text}>
          Таны ирц "{clubTitle}" клубт бүртгэгдлээ.
        </Text>
        <div style={statusContainer}>
          <div style={statusRow}>
            <Text style={label}>Төлөв:</Text>
            <Text style={statusValue}>{statusMap[status] || status}</Text>
          </div>
          <div style={statusRow}>
            <Text style={label}>Огноо:</Text>
            <Text style={dateValue}>{new Date(date).toLocaleDateString('mn-MN')}</Text>
          </div>
        </div>
        <div style={footer}>
          <Text style={footerText}>Энэ мэдэгдэл автомат илгээгдсэн болно.</Text>
        </div>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  margin: '40px auto',
  maxWidth: '600px',
  overflow: 'hidden',
  padding: '0',
};

const header = {
  backgroundColor: '#111827',
  padding: '24px',
  textAlign: 'center' as const,
};

const logo = {
  backgroundColor: '#3b82f6',
  borderRadius: '12px',
  height: '40px',
  margin: '0 auto',
  width: '40px',
};

const h1 = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: '600',
  letterSpacing: '-0.025em',
  margin: '32px 0 24px',
  padding: '0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  padding: '0 24px',
};

const statusContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  margin: '0 24px 24px',
  padding: '20px',
};

const statusRow = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const statusRowLast = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const statusValue = {
  backgroundColor: '#dbeafe',
  borderRadius: '6px',
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  padding: '4px 8px',
};

const dateValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  margin: '0 24px',
  padding: '16px 0',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
};

export default AttendanceEmail;