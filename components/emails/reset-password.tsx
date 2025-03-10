import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Link,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  resetLink,
}) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          Click the button below to reset your password. If you didn't request this, you can safely ignore this email.
        </Text>
        <Section style={buttonContainer}>
          <Button 
            style={{
              ...button,
              padding: '12px 20px',
            }}
            href={resetLink}
          >
            Reset Password
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If the button doesn't work, copy and paste this link: <Link href={resetLink} style={link}>{resetLink}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  maxWidth: '200px',
  margin: '0 auto',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
};

const link = {
  color: '#067df7',
  textDecoration: 'none',
}; 