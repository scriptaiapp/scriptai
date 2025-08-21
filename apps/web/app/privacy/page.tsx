import React from "react"
import { Card, CardContent } from "@/components/ui/card"

const PrivacyAndTerms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy & Terms of Use</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <section>
            <h2 className="text-xl font-semibold">1. Overview</h2>
            <p>
              Script AI is an AI-powered assistant that helps content creators generate high-quality YouTube scripts, titles, thumbnails, and course modules. By using our service, you agree to the following privacy and usage terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Data Collection</h2>
            <p>
              We collect and store only the necessary data to personalize your experience:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your email and profile info (via YouTube OAuth)</li>
              <li>Uploaded videos or video links (for training)</li>
              <li>Topics, scripts, and thumbnails you generate</li>
              <li>Basic analytics and usage metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Train and personalize your AI assistant</li>
              <li>Improve the accuracy of script generation</li>
              <li>Provide relevant research, references, and visuals</li>
              <li>Maintain account access and session control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Storage & Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption practices. We do not share or sell your data to third parties. You may request data deletion anytime by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. User Responsibilities</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Do not upload copyrighted content you don't own</li>
              <li>Do not use generated scripts to mislead or spread misinformation</li>
              <li>Ensure your use of Script AI complies with YouTube’s and OpenAI’s terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. AI Model Usage</h2>
            <p>
              Generated content is AI-assisted and should be reviewed before publishing. Script AI does not guarantee accuracy or legal compliance of generated output.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Changes to Policy</h2>
            <p>
              We may update our privacy policy and terms of service as the product evolves. We’ll notify you of major changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p>
              For questions, concerns, or data requests, please reach out to us at <a href="mailto:support@scriptai.com" className="underline text-blue-600">support@scriptai.com</a>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacyAndTerms