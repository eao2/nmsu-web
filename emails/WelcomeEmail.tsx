// emails/WelcomeEmail.tsx
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

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Оюутны холбоонд тавтай морил</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <div style={logo}></div>
        </div>
        <Heading style={h1}>Тавтай морил!</Heading>
        <Text style={text}>
          Сайн байна уу {userName},
        </Text>
        <Text style={text}>
          Та оюутны холбооны платформд амжилттай бүртгүүллээ. Одоо та клубуудад элсэж, 
          хамтран ажиллах боломжтой боллоо.
        </Text>
        <div style={featuresContainer}>
          <div style={feature}>
            <div style={featureIcon}></div>
            <Text style={featureTitle}>Клубуудад нэгдэх</Text>
            <Text style={featureText}>Та сонирхсон клубуудад элсэж, тэдний үйл ажиллагаанд оролцох боломжтой</Text>
          </div>
          <div style={feature}>
            <div style={featureIcon}></div>
            <Text style={featureTitle}>Хамтран ажиллах</Text>
            <Text style={featureText}>Клубын гишүүдтэй танилцах, санаа солилцох, төслүүдэд хамтран ажиллах</Text>
          </div>
        </div>
        <Section style={buttonContainer}>
          <Button style={button} href={process.env.NEXTAUTH_URL}>
            Платформ руу очих
          </Button>
        </Section>
        <Text style={closingText}>
          Амжилт хүсье!
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
  margin: '0 0 16px',
  padding: '0 24px',
};

const featuresContainer = {
  margin: '24px 24px 32px',
};

const feature = {
  alignItems: 'flex-start',
  display: 'flex',
  marginBottom: '20px',
};

const featureIcon = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  flexShrink: 0,
  height: '40px',
  marginRight: '16px',
  width: '40px',
};

const featureTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const featureText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
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

export default WelcomeEmail;