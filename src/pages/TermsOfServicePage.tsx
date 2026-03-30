
import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import useScrollToTop from "@/hooks/useScrollToTop";
import { PUBLIC_ROUTE_META } from "@/lib/seo/publicMetadata";

const legalPageHeadingClassName = "text-4xl font-bold mb-8 text-foreground";
const legalSectionHeadingClassName = "text-2xl font-bold mb-4 text-foreground";
const legalSubheadingClassName = "text-xl font-semibold mb-3 text-foreground";
const legalBodyClassName = "mb-4 text-foreground";
const legalLeadClassName = "text-lg text-foreground";
const legalListClassName = "list-disc pl-6 space-y-2 mb-4 text-foreground";
const legalListItemClassName = "text-foreground";

const TermsOfServicePage = () => {
  useScrollToTop();
  
  usePageMetadata(PUBLIC_ROUTE_META["/terms-of-service"]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
        <h1 className={legalPageHeadingClassName}>Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-6">
              <strong className="text-muted-foreground">Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className={legalLeadClassName}>
              Welcome to DemoStoke! These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using DemoStoke, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>1. Service Description</h2>
            <p className={legalBodyClassName}>
              DemoStoke is a platform that connects users with local gear owners, shops, and shapers to demo outdoor equipment including snowboards, skis, surfboards, and mountain bikes before purchase.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>2. Account Registration</h2>
            <p className={legalBodyClassName}>To use certain features of our service, you must:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Create an account with accurate information</li>
              <li className={legalListItemClassName}>Be at least 18 years old or have parental consent</li>
              <li className={legalListItemClassName}>Maintain the security of your account credentials</li>
              <li className={legalListItemClassName}>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>3. User Responsibilities</h2>
            <h3 className={legalSubheadingClassName}>For All Users</h3>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Use the platform in accordance with all applicable laws</li>
              <li className={legalListItemClassName}>Provide accurate and up-to-date information</li>
              <li className={legalListItemClassName}>Respect other users and communicate professionally</li>
              <li className={legalListItemClassName}>Report any safety concerns or policy violations</li>
            </ul>

            <h3 className={legalSubheadingClassName}>For Gear Owners</h3>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Ensure equipment is safe and in good working condition</li>
              <li className={legalListItemClassName}>Provide accurate descriptions and specifications</li>
              <li className={legalListItemClassName}>Honor demo appointments and agreements</li>
              <li className={legalListItemClassName}>Maintain appropriate insurance coverage</li>
            </ul>

            <h3 className={legalSubheadingClassName}>For Gear Demers</h3>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Use equipment safely and as intended</li>
              <li className={legalListItemClassName}>Return equipment in the same condition</li>
              <li className={legalListItemClassName}>Follow all safety guidelines and instructions</li>
              <li className={legalListItemClassName}>Respect demo time limits and agreements</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>4. Safety and Liability</h2>
            <p className={legalBodyClassName}>
              <strong className="text-foreground">Important:</strong> Outdoor sports involve inherent risks. Users participate in demos at their own risk.
            </p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>DemoStoke is a platform facilitating connections between users</li>
              <li className={legalListItemClassName}>We do not own, inspect, or warrant any equipment</li>
              <li className={legalListItemClassName}>Users must assess equipment safety before use</li>
              <li className={legalListItemClassName}>Proper safety equipment and precautions are required</li>
              <li className={legalListItemClassName}>Users should have appropriate insurance coverage</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>5. Prohibited Activities</h2>
            <p className={legalBodyClassName}>You may not:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Use the platform for illegal activities</li>
              <li className={legalListItemClassName}>Misrepresent equipment condition or your identity</li>
              <li className={legalListItemClassName}>Bypass safety features or security measures</li>
              <li className={legalListItemClassName}>Spam, harass, or abuse other users</li>
              <li className={legalListItemClassName}>Violate intellectual property rights</li>
              <li className={legalListItemClassName}>Attempt to damage or disrupt the platform</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>6. Transactions and Payments</h2>
            <p className={legalBodyClassName}>
              When transactions occur through our platform:
            </p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Payment terms are agreed upon between users</li>
              <li className={legalListItemClassName}>DemoStoke may facilitate but does not guarantee transactions</li>
              <li className={legalListItemClassName}>Users are responsible for applicable taxes</li>
              <li className={legalListItemClassName}>Refund policies are determined by individual sellers</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>7. Intellectual Property</h2>
            <p className={legalBodyClassName}>
              The DemoStoke platform, including its design, features, and content, is protected by intellectual property laws. Users retain ownership of their uploaded content but grant us a license to use it in connection with our services.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>8. Privacy</h2>
            <p className={legalBodyClassName}>
              Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-ocean hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>9. Limitation of Liability</h2>
            <p className={legalBodyClassName}>
              To the fullest extent permitted by law, DemoStoke and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>10. Termination</h2>
            <p className={legalBodyClassName}>
              We may suspend or terminate your account for violations of these Terms or for any other reason at our discretion. You may also terminate your account at any time.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>11. Changes to Terms</h2>
            <p className={legalBodyClassName}>
              We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>12. Contact Information</h2>
            <p className={legalBodyClassName}>
              For questions about these Terms, please <Link to="/contact-us" className="text-ocean hover:underline">contact us</Link>.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>13. Governing Law</h2>
            <p className={legalBodyClassName}>
              These Terms are governed by the laws of the jurisdiction where DemoStoke operates, without regard to conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
