-- ── Page Content Settings Migration ─────────────────────────────────────────
-- Adds default content for all 6 public pages.
-- Uses ON CONFLICT DO NOTHING so existing admin edits are never overwritten.

INSERT INTO admin_settings (key, value) VALUES

  -- ── About page ──────────────────────────────────────────────────────────────
  ('page_about_title',         'About Us'),
  ('page_about_subtitle',      'Building Kerala''s most trusted real estate platform'),
  ('page_about_story',         'Founded in 2020, PropertyFlow has helped thousands of families find their dream homes across Kerala. We combine local market expertise with modern technology to make property transactions transparent, efficient, and stress-free.'),
  ('page_about_mission',       'To make property transactions transparent, efficient, and stress-free for every family in Kerala.'),
  ('page_about_vision',        'A Kerala where every family finds their dream home with ease and confidence.'),
  ('page_about_stat_1_label',  'Founded'),
  ('page_about_stat_1_value',  '2020'),
  ('page_about_stat_2_label',  'Properties Sold'),
  ('page_about_stat_2_value',  '2,500+'),
  ('page_about_stat_3_label',  'Happy Clients'),
  ('page_about_stat_3_value',  '1,800+'),
  ('page_about_stat_4_label',  'Cities Covered'),
  ('page_about_stat_4_value',  '15+'),
  ('page_about_team_1_name',   'Robin Chacko'),
  ('page_about_team_1_role',   'Founder & CEO'),
  ('page_about_team_1_bio',    '15 years in Kerala real estate. Passionate about making property transactions simple and transparent for everyone.'),
  ('page_about_team_2_name',   'Priya Menon'),
  ('page_about_team_2_role',   'Head of Sales'),
  ('page_about_team_2_bio',    'Expert in residential properties across Kochi and Thrissur with 10+ years of experience.'),
  ('page_about_team_3_name',   'Arjun Nair'),
  ('page_about_team_3_role',   'Lead Agent'),
  ('page_about_team_3_bio',    'Specializes in commercial and investment properties across South Kerala.'),

  -- ── Services page ───────────────────────────────────────────────────────────
  ('page_services_title',    'Our Services'),
  ('page_services_subtitle', 'Everything you need for a seamless property journey'),
  ('page_services_1_title',  'Buy a Property'),
  ('page_services_1_desc',   'Browse thousands of verified listings across Kerala. Apartments, villas, plots, and commercial spaces.'),
  ('page_services_1_icon',   'home'),
  ('page_services_1_url',    '/listings'),
  ('page_services_2_title',  'Sell / Rent'),
  ('page_services_2_desc',   'List your property and reach thousands of verified buyers and tenants across Kerala.'),
  ('page_services_2_icon',   'tag'),
  ('page_services_2_url',    '/sell'),
  ('page_services_3_title',  'Property Valuation'),
  ('page_services_3_desc',   'Get an accurate market value estimate based on real transaction data and local market trends.'),
  ('page_services_3_icon',   'chart'),
  ('page_services_3_url',    '/contact'),
  ('page_services_4_title',  'Legal Assistance'),
  ('page_services_4_desc',   'End-to-end legal support — title verification, documentation, registration, and more.'),
  ('page_services_4_icon',   'shield'),
  ('page_services_4_url',    '/contact'),
  ('page_services_5_title',  'Home Loans'),
  ('page_services_5_desc',   'Get pre-approved home loans from top banks with the best interest rates in Kerala.'),
  ('page_services_5_icon',   'bank'),
  ('page_services_5_url',    '/contact'),
  ('page_services_6_title',  'Interior Design'),
  ('page_services_6_desc',   'Transform your new home with expert designers who understand Kerala architecture and style.'),
  ('page_services_6_icon',   'palette'),
  ('page_services_6_url',    '/contact'),

  -- ── Contact page ────────────────────────────────────────────────────────────
  ('page_contact_title',    'Contact Us'),
  ('page_contact_subtitle', 'We''re here to help you find your dream property'),
  ('page_contact_address',  '123 MG Road, Kochi, Kerala 682011'),
  ('page_contact_hours',    'Mon–Sat: 9am–6pm IST'),
  ('page_contact_map_url',  ''),

  -- ── FAQ page ────────────────────────────────────────────────────────────────
  ('page_faq_title',    'Frequently Asked Questions'),
  ('page_faq_subtitle', 'Got questions? We have answers.'),
  ('page_faq_1_q', 'How do I list my property?'),
  ('page_faq_1_a', 'Visit our Sell page, fill in your property details, upload photos, and submit. Our team reviews and publishes your listing within 24 hours.'),
  ('page_faq_2_q', 'Is it free to browse listings?'),
  ('page_faq_2_a', 'Yes! Browsing all property listings on our platform is completely free. No registration required.'),
  ('page_faq_3_q', 'How do I contact a property owner?'),
  ('page_faq_3_a', 'Each listing has a WhatsApp and call button. Click either to instantly connect with the agent or owner.'),
  ('page_faq_4_q', 'Are the listings verified?'),
  ('page_faq_4_a', 'All listings go through our verification process before going live. We check property documents and ownership details.'),
  ('page_faq_5_q', 'How long does it take for my listing to go live?'),
  ('page_faq_5_a', 'Listings are typically reviewed and published within 24 hours of submission on business days.'),
  ('page_faq_6_q', 'Can I edit my listing after submission?'),
  ('page_faq_6_a', 'Yes. Use the Track Status page with your submission ID to request edits or contact our support team.'),
  ('page_faq_7_q', 'What areas do you cover?'),
  ('page_faq_7_a', 'We currently cover all major cities and districts in Kerala including Kochi, Trivandrum, Calicut, Thrissur, Kannur, and more.'),
  ('page_faq_8_q', 'How do I get a property valuation?'),
  ('page_faq_8_a', 'Contact us via WhatsApp or phone with your property details. Our experts will provide a free market value estimate within 48 hours.'),

  -- ── Testimonials page ───────────────────────────────────────────────────────
  ('page_testimonials_title',    'What Our Clients Say'),
  ('page_testimonials_subtitle', 'Real stories from families and investors who found their perfect property with us'),
  ('page_testimonials_1_name',   'Anand Jose'),
  ('page_testimonials_1_role',   'Broker, Kochi'),
  ('page_testimonials_1_text',   'I stopped losing leads in WhatsApp the day I switched to PropertyFlow. The CRM is a game-changer for any serious realtor in Kerala.'),
  ('page_testimonials_1_rating', '5'),
  ('page_testimonials_2_name',   'Meena Krishnan'),
  ('page_testimonials_2_role',   'Homebuyer, Thrissur'),
  ('page_testimonials_2_text',   'Found my dream 3BHK apartment within 2 weeks! The listings were accurate and the agent was very responsive. Highly recommend.'),
  ('page_testimonials_2_rating', '5'),
  ('page_testimonials_3_name',   'Suresh Pillai'),
  ('page_testimonials_3_role',   'Property Investor, Trivandrum'),
  ('page_testimonials_3_text',   'Sold my commercial property in Trivandrum within a month at a great price. The platform connects you to serious buyers.'),
  ('page_testimonials_3_rating', '5'),
  ('page_testimonials_4_name',   'Divya Thomas'),
  ('page_testimonials_4_role',   'Villa Owner, Kochi'),
  ('page_testimonials_4_text',   'Listed my villa in the morning and got 5 enquiries by evening. The reach of this platform is incredible.'),
  ('page_testimonials_4_rating', '5'),
  ('page_testimonials_5_name',   'Rahul Varma'),
  ('page_testimonials_5_role',   'NRI Buyer, Dubai'),
  ('page_testimonials_5_text',   'As an NRI, finding trustworthy property listings from abroad was always stressful. PropertyFlow made it so easy and transparent.'),
  ('page_testimonials_5_rating', '5'),
  ('page_testimonials_6_name',   'Lakshmi Nair'),
  ('page_testimonials_6_role',   'Plot Buyer, Calicut'),
  ('page_testimonials_6_text',   'The site is clean, listings are real, and support was excellent. Got a great plot deal in my budget. Thank you team!'),
  ('page_testimonials_6_rating', '5'),

  -- ── Privacy page ────────────────────────────────────────────────────────────
  ('page_privacy_title',   'Privacy Policy'),
  ('page_privacy_updated', 'September 2026'),
  ('page_privacy_content', 'We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.

**Information We Collect**
We collect information you provide directly to us, such as your name, email address, phone number, and property details when you submit a listing or make an enquiry through our platform.

**How We Use Your Information**
We use the information we collect to display listings, connect buyers with sellers, send you updates about your submission status, respond to your enquiries, and improve our services.

**Data Sharing**
We do not sell, trade, or otherwise transfer your personal information to third parties. We may share your contact information with the relevant property agent or owner when you make an enquiry.

**Data Security**
We implement industry-standard security measures including SSL encryption to protect your personal information from unauthorized access, alteration, disclosure, or destruction.

**Cookies**
Our website uses cookies to enhance your browsing experience, analyze site traffic, and remember your preferences. You can disable cookies in your browser settings.

**Contact**
If you have any questions about this Privacy Policy, please contact us via our Contact page.')

ON CONFLICT (key) DO NOTHING;
