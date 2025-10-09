// emails/JoinRequestEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface JoinRequestEmailProps {
  clubTitle: string;
  userName: string;
}

export const JoinRequestEmail = ({ clubTitle, userName }: JoinRequestEmailProps) => (
  <Html>
    <Head />
    <Preview>Шинэ элсэлтийн хүсэлт</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <div style={logo}></div>
        </div>
        <Heading style={h1}>Шинэ элсэлтийн хүсэлт</Heading>
        <Text style={text}>
          {userName} "{clubTitle}" клубт элсэх хүсэлт илгээлээ.
        </Text>
        <div style={requestContainer}>
          <div style={requestRow}>
            <Text style={label}>Оюутан:</Text>
            <Text style={value}>{userName}</Text>
          </div>
          <div style={requestRow}>
            <Text style={label}>Клуб:</Text>
            <Text style={value}>{clubTitle}</Text>
          </div>
        </div>
        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXTAUTH_URL}/clubs`}>
            Хүсэлтийг харах
          </Button>
        </Section>
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

const requestContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  margin: '0 24px 24px',
  padding: '20px',
};

const requestRow = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const requestRowLast = {
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

const buttonContainer = {
  padding: '0 24px 32px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#111827',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  transition: 'all 150ms ease',
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

export default JoinRequestEmail;