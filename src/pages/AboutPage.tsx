
import { useEffect } from "react";

const AboutPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container px-4 md:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About DemoStoke</h1>

        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            DemoStoke connects outdoor enthusiasts with local adventure equipment owners to facilitate gear demos before making a purchase decision.
          </p>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="mb-4">
              Our mission is to make adventure sports more accessible and sustainable by allowing people to try before they buy and connecting the local adventure community.
            </p>
            <p>
              By facilitating peer-to-peer equipment demos, we help:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Reduce waste from purchasing equipment that isn't the right fit</li>
              <li>Support local outdoor enthusiasts and small businesses</li>
              <li>Create community connections among like-minded adventurers</li>
              <li>Make adventure sports more accessible to newcomers</li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">How It Started</h2>
            <p className="mb-4">
              DemoStoke began when a group of friends realized how difficult it was to find the right equipment for various adventure sports.
            </p>
            <p>
              As avid surfers, snowboarders, and paddleboarders, we knew that buying without trying often led to poor equipment choices.
              We also recognized that many equipment owners were open to sharing their gear when they weren't using it.
            </p>
            <p className="mt-4">
              In 2023, we launched DemoStoke to connect these two groups and create a community-driven platform for equipment demos.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
            <p className="mb-4">
              We're a small, passionate team of outdoor enthusiasts and tech experts working to make adventure sports more accessible for everyone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/6.x/avataaars/svg?seed=team1"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Alex Rivera</h3>
                  <p className="text-sm text-muted-foreground">Co-Founder & CEO</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/6.x/avataaars/svg?seed=team2"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Jordan Chen</h3>
                  <p className="text-sm text-muted-foreground">Co-Founder & CTO</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/6.x/avataaars/svg?seed=team3"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Morgan Lee</h3>
                  <p className="text-sm text-muted-foreground">Head of Operations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src="https://api.dicebear.com/6.x/avataaars/svg?seed=team4"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Taylor Kim</h3>
                  <p className="text-sm text-muted-foreground">Head of Community</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              Have questions, feedback, or want to get involved? We'd love to hear from you!
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> hello@DemoStoke.com</p>
              <p><strong>Phone:</strong> (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Adventure St, San Francisco, CA 94110</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
