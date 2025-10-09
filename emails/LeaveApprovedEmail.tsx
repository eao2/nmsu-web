// emails/LeaveApprovedEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface LeaveApprovedEmailProps {
  clubTitle: string;
}

export const LeaveApprovedEmail = ({ clubTitle }: LeaveApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>Гарах хүсэлт зөвшөөрөгдлөө</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <div style={logo}></div>
        </div>
        <Heading style={h1}>Гарах хүсэлт зөвшөөрөгдлөө</Heading>
        <Text style={text}>
          Таны "{clubTitle}" клубаас гарах хүсэлт зөвшөөрөгдлөө. 
          Та одоо энэ клубын гишүүн биш болсон.
        </Text>
        <div style={statusContainer}>
          <div style={statusRow}>
            <Text style={label}>Клуб:</Text>
            <Text style={value}>{clubTitle}</Text>
          </div>
          <div style={statusRow}>
            <Text style={label}>Төлөв:</Text>
            <Text style={statusValue}>Зөвшөөрөгдсөн</Text>
          </div>
        </div>
        <Text style={closingText}>
          Баярлалаа!
        </Text>
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

const value = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
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

const closingText = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 24px',
  padding: '0 24px',
  textAlign: 'center' as const,
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

export default LeaveApprovedEmail;