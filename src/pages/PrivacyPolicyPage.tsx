
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

const PrivacyPolicyPage = () => {
  useScrollToTop();
  
  usePageMetadata(PUBLIC_ROUTE_META["/privacy-policy"]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16 max-w-4xl mx-auto">
        <h1 className={legalPageHeadingClassName}>Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground mb-6">
              <strong className="text-muted-foreground">Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className={legalLeadClassName}>
              At DemoStoke, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Information We Collect</h2>
            <h3 className={legalSubheadingClassName}>Personal Information</h3>
            <p className={legalBodyClassName}>When you create an account or use our services, we may collect:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Name and contact information (email address, phone number)</li>
              <li className={legalListItemClassName}>Profile information and preferences</li>
              <li className={legalListItemClassName}>Location data (to show you nearby gear)</li>
              <li className={legalListItemClassName}>Communication records between users</li>
              <li className={legalListItemClassName}>Transaction history and demo requests</li>
            </ul>

            <h3 className={legalSubheadingClassName}>Anonymous Analytics Data</h3>
            <p className={legalBodyClassName}>
              We collect anonymous data for performance analytics only, including:
            </p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Website usage patterns and page views</li>
              <li className={legalListItemClassName}>Device and browser information</li>
              <li className={legalListItemClassName}>Performance metrics and error logs</li>
              <li className={legalListItemClassName}>Search queries and filter preferences</li>
            </ul>
            <p className={legalBodyClassName}>
              This data is used solely to improve our platform's performance and user experience.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>How We Use Your Information</h2>
            <p className={legalBodyClassName}>We use your personal information to:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Provide and maintain our services</li>
              <li className={legalListItemClassName}>Connect you with gear owners and facilitate demos</li>
              <li className={legalListItemClassName}>Send important account and service notifications</li>
              <li className={legalListItemClassName}>Improve our platform and develop new features</li>
              <li className={legalListItemClassName}>Ensure platform security and prevent fraud</li>
            </ul>
            <p className={legalBodyClassName}>
              <strong className="text-foreground">We will never sell your personal information for marketing purposes.</strong> Your data is used exclusively to provide our services and improve your experience on DemoStoke.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Information Sharing</h2>
            <p className={legalBodyClassName}>We may share your information only in the following circumstances:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>With other users when you engage in demos or communications</li>
              <li className={legalListItemClassName}>With service providers who help us operate our platform</li>
              <li className={legalListItemClassName}>When required by law or to protect our rights</li>
              <li className={legalListItemClassName}>In connection with a business transfer or acquisition</li>
            </ul>
            <p className={legalBodyClassName}>
              We do not sell, rent, or share your personal information with third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Data Security</h2>
            <p className={legalBodyClassName}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Encryption of sensitive data in transit and at rest</li>
              <li className={legalListItemClassName}>Regular security audits and monitoring</li>
              <li className={legalListItemClassName}>Access controls and authentication requirements</li>
              <li className={legalListItemClassName}>Secure hosting with industry-standard protections</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Your Rights</h2>
            <p className={legalBodyClassName}>You have the right to:</p>
            <ul className={legalListClassName}>
              <li className={legalListItemClassName}>Access and update your personal information</li>
              <li className={legalListItemClassName}>Delete your account and associated data</li>
              <li className={legalListItemClassName}>Opt out of non-essential communications</li>
              <li className={legalListItemClassName}>Request a copy of your data</li>
              <li className={legalListItemClassName}>Report privacy concerns or violations</li>
            </ul>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Financial Information</h2>
            <p className={legalBodyClassName}>
              DemoStoke does not store credit card numbers, bank account information, or other financial payment details. All payment processing is handled by secure third-party payment processors who comply with industry standards.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Children's Privacy</h2>
            <p className={legalBodyClassName}>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Changes to This Policy</h2>
            <p className={legalBodyClassName}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
            </p>
          </section>

          <section>
            <h2 className={legalSectionHeadingClassName}>Contact Us</h2>
            <p className={legalBodyClassName}>
              If you have any questions about this Privacy Policy or our privacy practices, please <Link to="/contact-us" className="text-ocean hover:underline">contact us</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
