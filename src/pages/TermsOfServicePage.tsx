
import usePageMetadata from "@/hooks/usePageMetadata";

const TermsOfServicePage = () => {
  usePageMetadata({
    title: "Terms of Service | DemoStoke",
    description: "Read the terms and conditions for using DemoStoke's gear demo platform.",
    type: "website"
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-lg">
              Welcome to DemoStoke! These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using DemoStoke, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Service Description</h2>
            <p className="mb-4">
              DemoStoke is a platform that connects users with local gear owners, shops, and shapers to demo outdoor equipment including snowboards, skis, surfboards, and mountain bikes before purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
            <p className="mb-4">To use certain features of our service, you must:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Create an account with accurate information</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <h3 className="text-xl font-semibold mb-3">For All Users</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Use the platform in accordance with all applicable laws</li>
              <li>Provide accurate and up-to-date information</li>
              <li>Respect other users and communicate professionally</li>
              <li>Report any safety concerns or policy violations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">For Gear Owners</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Ensure equipment is safe and in good working condition</li>
              <li>Provide accurate descriptions and specifications</li>
              <li>Honor demo appointments and agreements</li>
              <li>Maintain appropriate insurance coverage</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">For Gear Demers</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Use equipment safely and as intended</li>
              <li>Return equipment in the same condition</li>
              <li>Follow all safety guidelines and instructions</li>
              <li>Respect demo time limits and agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Safety and Liability</h2>
            <p className="mb-4">
              <strong>Important:</strong> Outdoor sports involve inherent risks. Users participate in demos at their own risk.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>DemoStoke is a platform facilitating connections between users</li>
              <li>We do not own, inspect, or warrant any equipment</li>
              <li>Users must assess equipment safety before use</li>
              <li>Proper safety equipment and precautions are required</li>
              <li>Users should have appropriate insurance coverage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Use the platform for illegal activities</li>
              <li>Misrepresent equipment condition or your identity</li>
              <li>Bypass safety features or security measures</li>
              <li>Spam, harass, or abuse other users</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to damage or disrupt the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Transactions and Payments</h2>
            <p className="mb-4">
              When transactions occur through our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Payment terms are agreed upon between users</li>
              <li>DemoStoke may facilitate but does not guarantee transactions</li>
              <li>Users are responsible for applicable taxes</li>
              <li>Refund policies are determined by individual sellers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              The DemoStoke platform, including its design, features, and content, is protected by intellectual property laws. Users retain ownership of their uploaded content but grant us a license to use it in connection with our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Privacy</h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-ocean hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by law, DemoStoke and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
            <p className="mb-4">
              We may suspend or terminate your account for violations of these Terms or for any other reason at our discretion. You may also terminate your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <p className="mb-4">
              Email: legal@demostoke.com<br />
              Or visit our <a href="/contact-us" className="text-ocean hover:underline">Contact Us</a> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
            <p className="mb-4">
              These Terms are governed by the laws of the jurisdiction where DemoStoke operates, without regard to conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
