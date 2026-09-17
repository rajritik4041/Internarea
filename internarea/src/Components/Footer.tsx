import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

          <FooterSection
            title="Internship by places"
            items={[
              { name: "New York", href: "/internship/new-york" },
              { name: "Los Angeles", href: "/internship/los-angeles" },
              { name: "Chicago", href: "/internship/chicago" },
              { name: "San Francisco", href: "/internship/san-francisco" },
              { name: "Miami", href: "/internship/miami" },
              { name: "Seattle", href: "/internship/seattle" },
            ]}
          />

          <FooterSection
            title="Internship by stream"
            items={[
              { name: "About us", href: "/about" },
              { name: "Careers", href: "/careers" },
              { name: "Press", href: "/press" },
              { name: "News", href: "/news" },
              { name: "Media kit", href: "/media-kit" },
              { name: "Contact", href: "/contact" },
            ]}
          />

          <FooterSection
            title="Job Places"
            items={[
              { name: "Blog", href: "/blog" },
              { name: "Newsletter", href: "/newsletter" },
              { name: "Events", href: "/events" },
              { name: "Help center", href: "/help-center" },
              { name: "Tutorials", href: "/tutorials" },
              { name: "Support", href: "/support" },
            ]}
          />
          

          <FooterSection
            title="Jobs by streams"
            items={[
              { name: "Startups", href: "/jobs/startups" },
              { name: "Enterprise", href: "/jobs/enterprise" },
              { name: "Government", href: "/jobs/government" },
              { name: "SaaS", href: "/jobs/saas" },
              { name: "Marketplaces", href: "/jobs/marketplaces" },
              { name: "Ecommerce", href: "/jobs/ecommerce" },
            ]}
          />

        </div>

        <hr className="my-10 border-gray-600" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

          <FooterSection
            title="About us"
            items={[
              { name: "Startups", href: "/about/startups" },
              { name: "Enterprise", href: "/about/enterprise" },
            ]}
          />

          <FooterSection
            title="Team diary"
            items={[
              { name: "Startups", href: "/team/startups" },
              { name: "Enterprise", href: "/team/enterprise" },
            ]}
          />

          <FooterSection
            title="Terms and conditions"
            items={[
              { name: "Terms", href: "/terms" },
              { name: "Privacy Policy", href: "/privacy-policy" },
            ]}
          />

          <FooterSection
            title="Sitemap"
            items={[
              { name: "Sitemap", href: "/sitemap" },
            ]}
          />

        </div>


        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center">


          <a
            href="/android-app"
            className="flex items-center gap-2 border border-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700"
          >
            <i className="bi bi-google-play"></i>
            Get Android App
          </a>


          <div className="flex space-x-4 mt-4 sm:mt-0">

            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            </a>

            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="w-6 h-6 hover:text-pink-400 cursor-pointer" />
            </a>

          </div>


          <p className="mt-4 sm:mt-0 text-sm text-gray-400">
            © Copyright 2025. All Rights Reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300">
        {title}
      </h3>

      <div className="flex flex-col items-start mt-4 space-y-3">

        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="text-gray-400 hover:text-blue-400 hover:underline"
          >
            {item.name}
          </a>
        ))}

      </div>
    </div>
  );
}