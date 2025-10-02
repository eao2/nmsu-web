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

interface NewPostEmailProps {
  clubTitle: string;
  authorName: string;
  content: string;
}

export const NewPostEmail = ({ clubTitle, authorName, content }: NewPostEmailProps) => (
  <Html>
    <Head />
    <Preview>Шинэ нийтлэл - {clubTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <div style={logo}></div>
        </div>
        <Heading style={h1}>Шинэ нийтлэл</Heading>
        <Text style={text}>
          {authorName} "{clubTitle}" клубт шинэ нийтлэл нэмлээ:
        </Text>
        <div style={postContainer}>
          <div style={postHeader}>
            <div style={authorAvatar}></div>
            <div style={authorInfo}>
              <Text style={authorNameText}>{authorName}</Text>
              <Text style={clubNameText}>{clubTitle}</Text>
            </div>
          </div>
          <Section style={contentBox}>
            <Text style={contentText}>{content.substring(0, 200)}{content.length > 200 ? '...' : ''}</Text>
          </Section>
        </div>
        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXTAUTH_URL}/clubs`}>
            Нийтлэлийг үзэх
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

const postContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  margin: '0 24px 24px',
  overflow: 'hidden',
};

const postHeader = {
  alignItems: 'center',
  display: 'flex',
  padding: '16px',
};

const authorAvatar = {
  backgroundColor: '#e5e7eb',
  borderRadius: '50%',
  height: '40px',
  marginRight: '12px',
  width: '40px',
};

const authorInfo = {
  flex: 1,
};

const authorNameText = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const clubNameText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const contentBox = {
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e5e7eb',
  padding: '16px',
};

const contentText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
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

export default NewPostEmail;