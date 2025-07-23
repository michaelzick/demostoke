
import usePageMetadata from "@/hooks/usePageMetadata";
import useScrollToTop from "@/hooks/useScrollToTop";

const PrivacyPolicyPage = () => {
  useScrollToTop();
  
  usePageMetadata({
    title: "Privacy Policy | DemoStoke",
    description: "Learn about how DemoStoke protects your privacy and handles your personal information.",
    type: "website"
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-lg">
              At DemoStoke, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p className="mb-4">When you create an account or use our services, we may collect:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Profile information and preferences</li>
              <li>Location data (to show you nearby gear)</li>
              <li>Communication records between users</li>
              <li>Transaction history and demo requests</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Anonymous Analytics Data</h3>
            <p className="mb-4">
              We collect anonymous data for performance analytics only, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Website usage patterns and page views</li>
              <li>Device and browser information</li>
              <li>Performance metrics and error logs</li>
              <li>Search queries and filter preferences</li>
            </ul>
            <p className="mb-4">
              This data is used solely to improve our platform's performance and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide and maintain our services</li>
              <li>Connect you with gear owners and facilitate demos</li>
              <li>Send important account and service notifications</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
            <p className="mb-4">
              <strong>We will never sell your personal information for marketing purposes.</strong> Your data is used exclusively to provide our services and improve your experience on DemoStoke.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
            <p className="mb-4">We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>With other users when you engage in demos or communications</li>
              <li>With service providers who help us operate our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
            <p className="mb-4">
              We do not sell, rent, or share your personal information with third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure hosting with industry-standard protections</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
              <li>Report privacy concerns or violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Financial Information</h2>
            <p className="mb-4">
              DemoStoke does not store credit card numbers, bank account information, or other financial payment details. All payment processing is handled by secure third-party payment processors who comply with industry standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please <a href="/contact-us" className="text-ocean hover:underline">contact us</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
