"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect } from "react"
import Lenis from 'lenis'

const PrivacyAndTerms = () => {
  useEffect(() => {

    const lenis = new Lenis({
      autoRaf: true,
    });

    lenis.on('scroll', (e) => {
      console.log(e);
    });
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy & Terms of Use</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">

          <section>
            <h2 className="text-xl font-semibold">1. Overview</h2>
            <p>
              Script AI is an AI-powered assistant that helps content creators generate high-quality
              YouTube scripts, titles, thumbnails, and course modules. By using our service, you agree
              to the following privacy and usage terms, which are designed to align with Google’s API Services User Data Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Data We Collect</h2>
            <p>
              When you connect your YouTube account, we only request the minimum permissions necessary
              to deliver Script AI’s core features. Specifically, we may access:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your email address and basic profile information (via YouTube OAuth)</li>
              <li>Channel information and video metadata (e.g., titles, descriptions, tags)</li>
              <li>Uploaded videos or video links you provide for training purposes</li>
              <li>Topics, scripts, and thumbnails you generate with Script AI</li>
              <li>Basic analytics and usage metrics to improve our service</li>
            </ul>
            <p className="mt-2">
              We do not request access to unnecessary data, and we will never request future access
              to data unrelated to Script AI’s features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Train and personalize your AI assistant experience</li>
              <li>Improve the accuracy and quality of generated scripts</li>
              <li>Provide research, references, and visuals relevant to your content</li>
              <li>Maintain your account access and session control</li>
            </ul>
            <p className="mt-2">
              We will not use your YouTube data for advertising, resale, credit checks, or any other
              unauthorized purpose. Your data is never sold or transferred to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Human Access to Data</h2>
            <p>
              Script AI’s systems are automated. No human at Script AI can access your YouTube data
              unless you explicitly request support that requires it, or when required by law, security
              investigations, or bug fixing. Otherwise, your data remains private and machine-processed only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Storage & Security</h2>
            <p>
              Your data is encrypted in transit and at rest using industry best practices. We take
              reasonable and appropriate measures to protect against unauthorized access, loss, or misuse.
              You may request deletion of your data at any time by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. User Responsibilities</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Do not upload copyrighted content you don’t own</li>
              <li>Do not use generated scripts to mislead or spread misinformation</li>
              <li>Ensure your use of Script AI complies with YouTube’s and OpenAI’s terms</li>
              <li>This app is not directed at children under 13, and should not be used by them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Limited Use & Consent</h2>
            <p>
              Script AI’s use of data obtained from Google APIs adheres to Google API Services User Data Policy,
              including the Limited Use requirements. If we ever change how we use your data, we will
              notify you and request your consent before applying the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. AI Model Usage</h2>
            <p>
              Generated content is AI-assisted and should be reviewed before publishing. Script AI
              does not guarantee the accuracy or legal compliance of generated output.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Google API Disclosure</h2>
            <p>
              Script AI’s use and transfer of information received from Google APIs will adhere
              to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to Policy</h2>
            <p>
              We may update this privacy policy and terms of service as the product evolves.
              We will notify you of major changes via email or in-app notifications and
              request your consent when required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p>
              For questions, concerns, or data requests, please reach out to us at{" "}
              <a href="mailto:support@tryscriptai.com" className="underline text-blue-600">
                support@tryscriptai.com
              </a>.
            </p>
          </section>

        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacyAndTerms
