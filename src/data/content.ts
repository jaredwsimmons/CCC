// Site content — the actual language of chelseachurch.com (crawled 2026-07-03),
// reorganized for the new layout. Wording is theirs; only structure is ours.
// Staff will maintain this through Sanity once the CMS project is wired up.

import { site } from './site';

/* ================================ HOME ================================ */

export const home = {
  hero: {
    title: 'Pursuing God. Pursuing others.',
    sub: 'Worship & Community Groups',
    times: '9:00 AM & 10:30 AM',
    image: '/images/worship-service.webp',
    imageAlt: 'The Chelsea Community Church family standing in worship on Sunday morning',
  },
  welcome: {
    eyebrow: 'Welcome',
    title: 'Welcome to Chelsea Community Church',
    body: 'Chelsea Community Church exists to pursue God and pursue others, and we desire to be known as a people who love God and love others well. Our heart is to live life together by worshiping the Father, growing in faith, and sharing in fellowship and ministry with each other.',
  },
  series: {
    eyebrow: 'Current sermon series',
    title: 'Jesus Storyteller',
    body: 'This summer, join us for Jesus Storyteller: Learning from the Parables of Jesus — a journey through the unforgettable stories Jesus used to reveal truth, challenge hearts, and invite people into the Kingdom of God. From lost sons and good Samaritans to persistent widows and mustard seeds, these timeless parables still speak powerfully today. Come discover how the stories Jesus told can transform the way we live, love, and follow Him. Join us Sunday at 9:00 or 10:30 AM!',
    art: '/images/series-jesus-storyteller.webp',
    artAlt: 'Jesus Storyteller — Learning from the Parables of Jesus, current sermon series art',
  },
  app: {
    eyebrow: 'Spotlight',
    title: 'New church app',
    body: 'Give, sign up for events, connect with a community, check your family in, and more! Download the Church Center app today, search for Chelsea Community Church, and log in with the email or phone number connected to your Planning Center profile.',
    image: '/images/app-spotlight.webp',
    imageAlt: 'The Church Center app for Chelsea Community Church on a phone, with App Store and Google Play badges',
  },
};

/* ============================== I'M NEW =============================== */

export const imnew = {
  hero: {
    title: 'What to Expect',
    image: '/images/building-aerial.webp',
    imageAlt: 'Aerial view of the Chelsea Community Church building beside the Chelsea Park clocktower',
  },
  expect: [
    'Chelsea Community Church has worship services and community groups that meet at 9:00 AM and 10:30 AM each Sunday. Our music is a mix of contemporary songs and hymns that give us life and energy while teaching us strong, Biblical truth. Our sermons are always rooted in the truth of Scripture. They’re designed to explain what it says and what it means for your life.',
    'There is special programming for preschoolers and kids at both hours, and middle and high schoolers meet together during our 9:00 AM service.',
  ],
  dress: {
    title: 'How to Dress',
    body: 'Come dressed comfortably! Whether you’re in jeans and a t-shirt or coat and tie, you will fit in with us.',
  },
  whereToGo: {
    title: 'Where to Go First',
    body: 'Our building has three covered entrances in the front. The Worship Room, Connections Desk, and Preschool Hall are most easily accessed through the entrance on the right. If you have an elementary-aged kid or a teenager, their activities are on the left side of the building, and it’s best to enter through the second covered door. There will be greeters at each of these doors to help you find your way.',
  },
  familyWorship: {
    title: 'Family Worship Sundays',
    body: 'In order to keep the primacy of families in the forefront of our culture, we cancel all age-graded ministry activities, Preschool through Students, every time a month has a 5th Sunday. Those days the whole church will worship together in the Worship Room.',
  },
  coming: {
    title: "Let Us Know You're Coming!",
    body: 'We can’t wait to meet you! Before you arrive, we’d love for you to share just a little bit of contact information with us. Don’t worry — we’ll keep it safe and only use it to thank you for visiting and to share any information you’d like to know about us.',
    desk: 'If you’re not ready to fill out the form or prefer to connect in person, that’s okay too! Be sure to stop by our Connections Desk — it’s just past the Worship Room. There, you can learn more about who we are, what we’re about, and pick up a special gift we’ve prepared just for you. We’re so glad you’re here!',
    image: '/images/lobby.webp',
    imageAlt: 'Guests and members connecting in the church lobby on a Sunday morning',
  },
};

/* ============================== BELIEFS =============================== */

export const beliefs = {
  hero: { title: 'What We Believe' },
  pursuit: {
    title: 'The Bible tells the story of God pursuing us.',
    image: '/images/creation-of-adam.webp',
    imageAlt: 'Detail of Michelangelo’s Creation of Adam — two hands reaching toward one another',
    body: [
      'From the very beginning, God has pursued us. After Adam and Eve sinned, they did not run toward God; they ran away from Him, hiding among the trees of the garden (Genesis 3:8-9).',
      'But God pursued them. “The Lord God called to the man, ‘Where are you?’”',
      'God has always been in pursuit of us, so that we could be in relationship with Him.',
      'Jesus used the parables of the lost sheep and the lost coin (Luke 15:3–10) to teach that God pursues us. Jesus’ purpose on earth was to “seek and to save that which is lost” (Luke 19:10). To seek something is to pursue it. You pursue what is important to you. Because we are important to Him, being created in His image and for His glory, God has pursued a relationship with us through the life, death, and resurrection of His son, Jesus Christ.',
      'God continues to pursue us, even after we have trusted in Christ for salvation. Through the Holy Spirit, God comforts (James 4:8), corrects (2 Timothy 3:16), and compels His children to obey His Word. He pursues us, conforming us to the image of His Son (Romans 8:29; Hebrews 12:5–7).',
      'He pursues us because it is only as we abide in Him and He in us that we can bear much fruit for His kingdom (John 15:1–8). His pursuit is for our good. There is no greater joy than being the objects of the Lord’s pursuit and following Him in response to His incredible love for us in Christ Jesus.',
    ],
  },
  vision: {
    title: 'Our Vision',
    tagline: 'Pursuing God. Pursuing others.',
    body: [
      'We believe God has called us to be a church that pursues Him and others, both inside and outside the church: loving God with all our heart, soul, and mind and loving our neighbors as ourselves (Matthew 22:37-39). To do this, we must know our purpose, live intentionally, and live in community.',
      'The Scriptures teach us that our purpose is to know God, be transformed, and tell others the good news of Jesus Christ.',
      'To live intentionally, we take practical steps to spend time with God through spiritual disciplines, to be connected to the church in dynamic relationships with others, and proclaim the gospel as we tell others about what Christ has done for them.',
      'As we understand our purpose and live intentionally, we do so in community. God has given us one another, the church, to encourage and spur one another on to good works — to love one another. At Chelsea Community Church, we seek to love one another in the friendship and fellowship of Christian community and our neighbors as ourselves.',
    ],
  },
  affiliation: {
    title: 'Our Affiliation',
    body: 'Double Oak Community Church began meeting in Mt Laurel on January 16, 2005 and started a second campus in Chelsea on August 12, 2018. After a congregational vote in December 2024, the Chelsea Campus has begun the process of pursuing independence and is operating as Chelsea Community Church in 2025. While maintaining our autonomy as a local body of believers, we identify ourselves as a community church in the Baptist tradition.',
    doccUrl: 'https://docc.org/',
  },
  statements: [
    {
      title: 'The Bible',
      refs: '2 Timothy 3:16-17; 2 Peter 1:20-21; Hebrews 4:12',
      text: 'We believe that the Scriptures in all 66 books of the Old and New Testaments are verbally inspired of God, error free in the original manuscripts, and the supreme authority of faith and practice for followers of Christ.',
    },
    {
      title: 'God',
      refs: 'Deuteronomy 6:4',
      text: 'We believe there is one living and true God, who is one in essence, while eternally existing in three distinct persons; Father, Son, and Holy Spirit.',
    },
    {
      title: 'Man',
      refs: 'Genesis 1:26-27; Romans 1:18-32, 3:10-23',
      text: 'We believe that mankind was directly created in the image of God to enjoy His fellowship and fulfill His purposes on earth. However, in Adam, all mankind fell into sin; consequently all people are spiritually dead and subject to the certainty of both physical and spiritual death apart from faith in Jesus Christ.',
    },
    {
      title: 'Salvation',
      refs: 'John 1:12, 3:16, 14:6; Ephesians 2:8-9',
      text: 'We believe that salvation is by grace alone, through faith alone in Jesus Christ alone. All who believe in Him are declared righteous by the Father on the grounds of Jesus Christ’s life, death and resurrection, being regenerated by and baptized in the Holy Spirit.',
    },
    {
      title: 'The Church',
      refs: 'Acts 2:41-47; Hebrews 10:24-25; 1 Corinthians 12-14',
      text: 'We believe that all who are “born again” by the Holy Spirit belong to the one true church and are instructed by the Scriptures to associate themselves in local, visible churches.',
    },
    {
      title: 'Ordinances',
      refs: 'Matthew 28:18-20; Romans 6:3-7; 1 Corinthians 11:23-29',
      text: 'We believe that baptism is an essential “first step” for all who, having believed in Christ for salvation, desire to walk as His disciple. Baptism is a clear injunction of the Scriptures which outwardly expresses the inward reality of new life in Christ. Our method of baptism is immersion as described in the New Testament and practiced in the early church. We believe that the Lord’s Supper is a memorial of Christ and His redemptive death. It is also an expression of our fellowship with one another. In communion, we are reminded of Christ’s first coming and encouraged to look forward to His coming again.',
    },
    {
      title: 'The Future',
      refs: 'Matthew 24:36; 1 Thessalonians 4:13-18',
      text: 'We believe the next great event of human history will be the personal return of Jesus Christ. This is the blessed hope for which all those who love Christ yearn. While the exact time of Christ’s return is unknown, it is imminent and certain.',
    },
  ],
};

/* ============================== LEADERS =============================== */

export const leaders = {
  staff: [
    { name: 'Alan Allgood', role: 'Lay Elder', image: '/images/leader-alan-allgood.webp' },
    { name: 'Mark Clayton', role: 'Lay Elder', image: '/images/leader-mark-clayton.webp' },
    { name: 'Wes Haisten', role: 'Lay Elder', image: '/images/leader-wes-haisten.webp' },
    { name: 'Drew Blake', role: 'Pastor of Students & Worship', image: '/images/leader-drew-blake.webp' },
    { name: 'John Herring', role: 'Executive Pastor', image: '/images/leader-john-herring.webp' },
    { name: 'Kathryn Kipley', role: 'Family Ministry Associate', image: '/images/leader-kathryn-kipley.webp' },
    { name: 'Brian Marbury', role: 'Pastor of Missions & Service', image: '/images/leader-brian-marbury.webp' },
    { name: 'Ben Stephenson', role: 'Family Pastor', image: '/images/leader-ben-stephenson.webp' },
  ],
  deacons: [
    { area: 'Adult Discipleship', names: 'Ryan Akers, Casey Ballenger' },
    { area: 'Building and Grounds', names: 'Trey Garrett, Daniel Ringpfeil' },
    { area: 'Benevolence', names: 'Brent Cool, Della Pender' },
    { area: 'Communion', names: 'Georgia Gabriel, Mike Gabriel' },
    { area: 'Connections', names: 'Lee Wood, Susanne Wood' },
    { area: 'Hospitality', names: 'April Bower, Jordan Hausen' },
    { area: 'Kids', names: 'Pam Cooley' },
    { area: 'Member Care', names: 'Stephanie Thomas' },
    { area: 'Men', names: 'Stephen Thomas' },
    { area: 'Missions', names: 'Jared Simmons' },
    { area: 'Prayer', names: 'Liz Clayton' },
    { area: 'Preschool', names: 'Marianne Dacey, Randi Street' },
    { area: 'Senior Adults', names: 'Dave Swanson' },
    { area: 'Singles', names: 'Linda Allison' },
    { area: 'Special Events', names: 'Tyler Stevens' },
    { area: 'Students', names: 'Andrew Hill, Courtney Hill' },
    { area: 'Teller', names: 'Terrell Cooley' },
    { area: 'Women', names: 'Alana Cool' },
    { area: 'Worship', names: 'Tanner Cain' },
  ],
};

/* ============================== HISTORY =============================== */

export const history = {
  hero: {
    title: 'History',
    image: '/images/building-clocktower.webp',
    imageAlt: 'The Chelsea Park clocktower with the Chelsea Community Church building behind it, alongside Highway 280',
  },
  body: 'In January of 2005 a church called Double Oak Community Church began meeting in the town of Mt. Laurel east of Birmingham on Highway 280. The heart of that church from its founding was to be an anchor point for ministry as the metro area spread farther out, particular toward the city of Chelsea. So on August 12, 2018, they started a second campus that met in Chelsea Park Elementary School. Land was purchased and a building was built right under the clocktower of the Chelsea Park neighborhood, and a new church began to grow. After a congregational vote in December 2024, the Chelsea Campus began the process of pursuing independence, officially becoming Chelsea Community Church in 2025. We are excited to be planting our roots just as Chelsea begins its own expansion. We are here to proclaim the Gospel of Jesus Christ and the hope of his Kingdom in Chelsea.',
};

/* ============================= MINISTRIES ============================= */

export const worship = {
  title: 'Worship',
  body: [
    'All of our Sunday worship services feature a blended worship style, including elements of both traditional and contemporary music. Our worship reflects our congregation which is a blend of all generations.',
    'Behind the scenes our tech team makes sure sound, lights, and video run smoothly. This ensures a worship environment free of distraction.',
  ],
  serveCta: { label: 'Click to serve with music or tech!', email: site.contacts.tech },
  images: [
    { src: '/images/worship-singer.webp', alt: 'A vocalist leading sung worship' },
    { src: '/images/worship-tech.webp', alt: 'The production team’s audio console during a service' },
  ],
};

export const preschool = {
  title: 'Preschool',
  getReady: {
    title: 'Get Ready For Sunday',
    body: 'If you are coming to worship with us for the first time soon, please click the button below to pre-register your family with us. This will make your check-in time very quick on Sunday morning! Our Preschool Check-In desk is through the entrance on the right side of the building, past the Worship Room.',
  },
  schedule: [
    { time: '9:00 AM', what: 'Preschool Worship' },
    { time: '10:30 AM', what: 'Preschool Community Groups' },
  ],
  newsletter: 'https://us20.campaign-archive.com/home/?u=6fa2b34c88de2cd28223fc41e&id=a20c63fb53',
  tips: [
    {
      title: 'Drop-Off Tips',
      body: 'It’s completely normal for little ones to feel a bit unsure during drop-off. From our experience, a quick goodbye usually helps them adjust faster. If you have special instructions or requests, please let us know. We want your child to feel safe and secure, and for you to feel at ease.',
    },
    {
      title: 'What to Bring',
      body: 'We have diapers and wipes if you need them. Just pack a labeled bottle or water cup for your child.',
    },
    {
      title: 'What to Wear',
      body: 'Your child will love playing outside (weather permitting) and getting creative with crafts like painting and coloring. Comfortable, easy-to-clean clothes are perfect.',
    },
  ],
  gallery: [
    '/images/preschool-1.webp',
    '/images/preschool-2.webp',
    '/images/preschool-3.webp',
    '/images/preschool-4.webp',
    '/images/preschool-5.webp',
    '/images/preschool-6.webp',
  ],
  contact: site.contacts.family,
};

export const kids = {
  title: 'Kids',
  mission:
    'Our Kids Ministry exists to train up children to pursue God and to pursue others. By providing a safe and loving environment, we create space for kids to explore their Bible and build strong, lasting relationships that mirror Christ’s love. We also champion the role of families, equipping them to pass on their own faith to their children.',
  getReady: {
    title: 'Get Ready For Sunday',
    body: 'If you are coming to worship with us for the first time soon, please click the button below to pre-register your family with us. This will make your check-in time very quick on Sunday morning! Our Kids Check-In desk is through the entrance on the left side of the building.',
  },
  schedule: [
    { time: '9:00 AM', what: 'Community Groups for K–5th grade' },
    { time: '10:30 AM', what: 'Kids Worship for all elementary ages' },
  ],
  worshipTogether: {
    title: 'Worship Together',
    body: 'At Chelsea Community Church we believe that the family is God’s main tool for calling children into a life of faith. Because of that we want to encourage you to consider having your kids attend the main worship service alongside you each Sunday, especially 3rd–5th graders. This way Worship Together is a load lifted with two arms, at home and at church.',
  },
  values: {
    image: '/images/kids-values.webp',
    imageAlt: 'Kids Ministry values: Gospel, Scripture, Family, Community, and Mission',
  },
  summer: {
    image: '/images/kids-summer-spectacular.webp',
    imageAlt: 'Summer Spectacular — summer activities for kids',
  },
  contact: site.contacts.family,
};

export const students = {
  title: 'Welcome to C3SM!',
  intro:
    "C3SM is our church's ministry to middle and high school students. We disciple students to become lifelong proclaimers of the good news of Jesus!",
  schedule: [
    {
      when: 'Sunday Mornings',
      what: 'Community groups (divided by age and gender) in the Community Room at 9 AM',
    },
    {
      when: 'Wednesday Nights',
      what: 'Games, student-led worship, and Bible teaching in the Worship Room at 6 PM',
    },
  ],
  photo: { src: '/images/students-c3sm.webp', alt: 'C3SM students and leaders on a summer trip' },
  contact: site.contacts.students,
};

export const men = {
  title: 'Men',
  discipleship: {
    title: 'Discipleship',
    items: ['Topic Based Studies', 'Monthly Fire Pit', 'Community Groups'],
    image: '/images/men-bible-study.webp',
    imageAlt: 'Men’s Bible Study weekly gatherings: Monday 6:00 AM at Bojangles, Thursday 6:30 AM at Mt. Laurel O’Henry’s, Thursday 6:30 PM and Friday 6:30 AM at the Church Commons',
  },
  fire: {
    title: 'Men On Fire',
    body: 'On the first Sunday of every month, all men gather around the fire pit — one place, one purpose. It’s a time for brotherhood, real conversation about Scripture, and powerful prayer.',
    image: '/images/men-on-fire.webp',
    imageAlt: 'Men On Fire — first Sunday every month at 6 PM',
  },
  relationships: {
    title: 'Relationships',
    body: 'We host two to three events each year that enable men to hang out with other men. This is an enjoyable time to have fun, deepen friendships, get to know one another and encourage one another.',
  },
  service: {
    title: 'Service',
    body: 'We are fortunate to have partnered with multiple local ministries and strive to lead our men to participate in opportunities to support and serve alongside our mission partners.',
  },
  contact: site.contacts.missions,
};

export const women = {
  title: 'Women',
  intro: [
    'At Chelsea Community Church, our Women’s Ministry exists to help women pursue God and pursue others by growing in their relationship with Christ, building authentic friendships, and living out their faith with confidence and purpose.',
    'We believe every woman — at every stage of life — has been uniquely created by God and called to make an impact in her home, church, workplace, and community. Whether you are new to faith, have walked with Christ for years, or are simply looking for connection, you are welcome here. Please join us at one of our upcoming events!',
  ],
  photo: { src: '/images/women-ministry.webp', alt: 'Women of Chelsea Community Church at a ministry event' },
  events: [
    {
      name: 'Summer Bible Study',
      when: 'Wednesday Nights in June',
      where: '6:00–7:15 PM | Community Room',
      note: 'No RSVP necessary!',
    },
    {
      name: 'Sundae Funday Bingo',
      when: 'Monday, July 13',
      where: '6:00–7:30 PM | Community Room',
      note: 'Free event! Register in Church Center!',
      rsvp: site.churchCenter.registrations.sundaeBingo,
      image: '/images/women-sundae-bingo.webp',
      imageAlt: 'Sundae Funday Bingo — Monday, July 13, 6:00–7:30 PM in the Community Room',
      detail: [
        'Ladies, mark your calendars for a sweet summer evening of fun, fellowship, and friendly competition! Join us for Sundae Funday Bingo on July 13 from 6:00–7:30 PM in the Community Room. Enjoy an evening filled with bingo, prizes, laughter, and delicious ice cream sundaes!',
        "To make our sundae bar extra special, please bring your favorite sundae topping or a salty snack to share. We'll provide the ice cream, and together we'll create a fun and tasty treat table for everyone to enjoy.",
        "As part of the evening, we'll also take a few moments to learn about All4 Jesus Belize and the incredible ways God is working through their ministry. You'll have an opportunity to support their upcoming mission trip through a voluntary donation that will help provide much-needed supplies.",
        "This event is free, but please RSVP by July 12 so we can prepare accordingly. We hope you'll join us for a wonderful evening of connection, encouragement, sweet treats, and lots of fun!",
      ],
    },
    {
      name: 'Ladies Breakfast',
      when: 'Saturday, August 22',
      where: '8:00 AM | Community Room',
      note: 'Check back soon for more details!',
    },
  ],
  contact: site.contacts.women,
  contactName: 'Tammy',
};

export const groups = {
  title: 'Community Groups',
  intro:
    'We believe in the importance in living life within biblical community and our community groups offer everyone that opportunity. We have groups for adults that meet during both our Sunday morning services, and some that meet throughout the week. Check out the list to see what fits you best!',
  list: [
    {
      when: 'Sundays | 9 AM',
      name: 'Generations',
      room: 'Room 101',
      desc: "This multi-generational community group believes there is much to be learned from believers across generations. The class aims to connect adults to others in the church, serve the church and the community, and grow together as it studies God's Word. It is led by Cooper and Andrea Kandler.",
    },
    {
      when: 'Sundays | 9 AM',
      name: 'Living Stones',
      room: 'Room 102',
      desc: 'Our goal is to love God and love our neighbor while we encourage each other to believe the gospel of Jesus, develop community together while living out the gospel in Chelsea and beyond. This group is led by Stephen Thomas.',
    },
    {
      when: 'Sundays | 10:30 AM',
      name: 'Warriors for God',
      room: 'Room 101',
      desc: 'Our group is based on Ephesians 6:14-17. We are preparing to be warriors of God as we seek after God’s heart. We exist to grow deeper in the study of God’s word, not merely reading words on a page, but desiring to see the Bible come alive! We also pray, serve and care for one another in times of need as a believing community who walks this life together. This group is led by Gerry Snell.',
    },
    {
      when: 'Sundays | 10:30 AM',
      name: 'Faith in the Trenches: Doing Life Together at All Ages',
      room: 'Room C5',
      desc: 'FitT is a purposefully multigenerational group of both singles and married couples committed to pursuing Christ through the message of the Gospel in their own lives and with the faith family at Chelsea Community Church. This includes the faithful sharing and demonstration of the Gospel with everyone they encounter and a welcoming of brothers and sisters to come do life together. This group is led by Mark and Liz Clayton.',
    },
    {
      when: 'Sundays | 10:30 AM',
      name: 'Young Adults',
      room: 'Room 102',
      desc: 'Our study for this year is Love Letters: Dynamic Relationships in God’s Word. We will explore a variety of letters and writings from both the Old and New Testaments that show how God’s love covers everything we, as believers, encounter in our lives. This group is led by Casey Ballenger and John Herring.',
    },
    {
      when: 'Sundays | 5:00 PM',
      name: 'Haisten Community Group',
      room: 'Meets in homes',
      desc: 'This group meets in homes and is currently at capacity. Leader: Wes Haisten',
    },
    {
      when: 'Wednesdays | 6 PM',
      name: 'Allgood Community Group',
      room: 'Meets in homes',
      desc: 'This group meets in homes and is currently at capacity. Leaders: Alan & Tammy Allgood',
    },
    {
      when: 'Wednesdays | 6 PM',
      name: 'exHIMplify',
      room: 'Room C5',
      desc: 'We desire to grow together in our knowledge and love of the Father and one another. We want to be known and to know one another as we do life together, living out our faith through authentic relationships. This group is led by Brian & Mandi Marbury and meets on campus Wednesday nights from 6-7 PM.',
    },
    {
      when: 'Wednesdays | 6 PM',
      name: 'Stringfellowship',
      room: 'Room 101',
      desc: 'This group seeks to be discipled in the word and to care for one another and seek fellowship with one another. The group is led by Matt and Carlye Stringfellow.',
    },
  ],
  contact: site.contacts.office,
  contactName: 'Rebecca',
};

export const missions = {
  title: 'Missions',
  verse: {
    text: '"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you."',
    ref: 'Matthew 28:19–20a',
  },
  highlight: {
    title: 'Monthly Missions Highlight',
    body: "The Big Kaboom is coming up on Saturday, June 27, and Chelsea Community Church is partnering with other local churches to provide a free Kids Zone for families in our community! The Kids Zone will feature inflatables, face painting, games, and other fun activities for children. We're looking for volunteers from 7:00–7:45 PM to assist with activities in the Kids Zone or help at our church booth. We'd love for you to join us — contact Pastor Brian for more information.",
    image: '/images/missions-big-kaboom.webp',
    imageAlt: 'Big Kaboom — Saturday, June 27, 7:00–7:45 PM. We need you! Contact Brian Marbury or scan the QR code to volunteer.',
  },
  local: [
    { name: 'Blanket Fort Hope', focus: 'Child trafficking survivors', url: 'https://blanketforthope.org/', newsletter: 'https://blanketforthope.org/around-the-fort-blog/' },
    { name: 'Alabama Childhood Food Solutions', focus: 'Food insecure families', url: 'https://alabamachildhoodfood.com/', newsletter: 'https://www.alabamachildhoodfood.com/blog' },
    { name: 'Songs in the Night', focus: 'Widow care', url: 'http://widowsong.org', newsletter: 'https://www.widowsong.org/blog' },
    { name: 'Brother Bryan Mission', focus: 'Men in need', url: 'https://bbmission.com/', newsletter: 'https://bbmission.com/news-events/' },
    { name: 'Hearts in Hands', focus: 'Community needs', url: 'https://heartsinhands.org/' },
    { name: 'LoveLife', focus: 'Expecting mothers and orphans', url: 'https://lovelife.org/', newsletter: 'https://lovelife.org/stories' },
    { name: "Children's Village", focus: 'Foster care', url: 'https://www.childrensvillagebham.com' },
    { name: "God's Outreach", focus: 'Families in need' },
    { name: "King's Home", focus: 'Hope for the abused', url: 'https://www.kingshome.com' },
  ],
  global: [
    { name: 'All4Jesus Belize', focus: 'Connecting American and Belizean believers to grow the church', url: 'https://all4jesusbelize.org' },
    { name: 'Regen Foundation', focus: 'Children and families in Romania', url: 'https://www.regenfoundation.org/index.php/en/', newsletter: 'https://www.regenfoundation.org/index.php/en/newsletters' },
    { name: 'International Sports Chaplains', focus: 'Evangelism at the Olympics', url: 'http://ischaplains.org', newsletter: 'https://www.ischaplains.org/items' },
    { name: "Simone's Kids", focus: 'Orphan care in Uganda', url: 'https://www.simoneskids.org/', newsletter: 'https://www.simoneskids.org/news/' },
    { name: 'Bringing Good News', focus: 'Least, Last, and Lost around the world', url: 'https://www.bringinggoodnews.org/', newsletter: 'https://www.bringinggoodnews.org/blog/' },
    { name: 'Two Feathers', focus: 'Choctaw Native Americans', url: 'https://www.facebook.com/twofeathersministries/' },
    { name: 'Overtoun House', focus: 'Centre for Hope and Healing', url: 'https://overtounhouse.org' },
  ],
  resources: [
    { title: 'Gospel People: A Call for Evangelical Integrity', author: 'Michael Reeves', url: 'https://www.amazon.com/dp/1433572931' },
    { title: 'Irresistible Faith: Becoming the Kind of Christian the World Can’t Resist', author: 'Scott Sauls', url: 'https://www.amazon.com/dp/1400201799' },
    { title: 'The Art of Neighboring: Building Genuine Relationships Right Outside Your Door', author: 'Jay Pathak & Dave Runyon', url: 'https://www.amazon.com/dp/080101459X' },
    { title: 'The Gospel and Personal Evangelism', author: 'Mark Dever', url: 'https://www.amazon.com/dp/143355724X' },
    { title: 'Sharing Jesus Without Freaking Out: Evangelism the Way You Were Born to Do It, 2nd ed.', author: 'Scott Hildreth & Steven McKinion', url: 'https://www.amazon.com/dp/1535982187' },
    { title: 'Contagious Faith: Discover Your Natural Style for Sharing Jesus with Others', author: 'Mark Mittelberg', url: 'https://www.amazon.com/dp/0310113288' },
  ],
  contact: site.contacts.missions,
};

export const serve = {
  title: 'Serve',
  verse: {
    text: '“But be doers of the word, and not hearers only, deceiving yourselves.”',
    ref: 'James 1:22',
  },
  intro: [
    'We invite you to join us on this journey of pursuit by checking out our Teams Mobilizer tool. This resource assists us in finding our place, knowing our purpose and being a people of pursuit.',
    "It's not a spiritual gifts inventory, and it doesn't sign you up to serve on a team. You'll get an email with your results, and you'll be contacted by Brian Marbury to talk more about where God might be calling you to serve.",
  ],
  survey: 'https://volunteeraccelerator.ministryarchitects.com/DOCC/survey.php',
  image: { src: '/images/teams-mobilizer.webp', alt: 'Teams Mobilizer — find your place, know your purpose, be people of pursuit' },
  itIs: [
    'A way to match people to ministry positions within the local church.',
    'Through a quick survey, our leadership can learn your unique skills and desires and you can learn which serving opportunities are the best match for you!',
  ],
  itIsNot: [
    'An automatic, team member sign up. (By completing the survey, you are not signing up for anything.)',
    "A new church database. (This doesn't have addresses or any financial information; this is just names, emails, phone numbers, and what you say you have a heart for.)",
    'A spiritual gifts inventory. (This tool matches the practical skills that you possess, along with your interests, with a real ministry opportunity in the church where you can serve.)',
  ],
  instructions: [
    {
      title: 'Be honest',
      body: 'This is a self-assessment. Only you truly know what you enjoy doing. So, for example, if working with kids isn’t your strength or you aren\'t great at music — it’s ok, choose an honest answer — not the answer that you think you\'re expected to answer.',
    },
    {
      title: 'See this as an opportunity',
      body: "Your results will be sent to your email. Once you get your results, we're asking that you pray about them. That's it, for now. Consider what the next season of serving and ministry looks like for you — and give yourself permission to try something new, if that could be a better fit.",
    },
    {
      title: 'Have some conversations',
      body: "Remember, this is not a sign up. Our hope is that this new tool will help us to enter into conversations about how the Lord has gifted and equipped you for ministry and how we can, as your pastors and leaders, join with you in your journey in helping you find your place, know your purpose and be a people of pursuit. Once you have completed the survey, our leadership will be in contact to talk about where you feel led to serve. And we hope you'll be open to having those conversations with us.",
    },
  ],
  closing:
    'Our hope and prayer has been and will be that we, as a body of believers, will receive all that God has given us and share that with each other. In so doing, we all get to participate in what the Spirit of God is doing among us.',
  contact: site.contacts.missions,
};

export const connections = {
  title: 'Connections',
  body: [
    'Our connections team is available each Sunday morning to assist every guest and church member. We will help everyone get connected to age specific ministries, community groups and events. We will also be happy to answer any questions that you may have and share information about our church.',
    'We believe that everyone has a purpose and a place, and our hope as a connections team is to help everyone find his or her place within our church so that they can minister and be ministered to, living out their purpose. Being a part of a local church is vital to the health, growth and maturity of everyone.',
  ],
  image: { src: '/images/connections-welcome.webp', alt: 'A warm handshake of welcome' },
  contact: site.contacts.missions,
};

/* =============================== PRAYER =============================== */

export const prayer = {
  title: 'Prayer',
  cta: 'We want to pray for you! Whether you are mourning or celebrating, we are committed to walking alongside you. Click or tap the button to share your prayer concerns with us.',
  ministry:
    "At Chelsea Community Church we desire to be a church where prayer is central. We believe in the power of prayer because God's Word tells us that the prayer of a righteous person is powerful and effective (James 5:16). We believe that God is with us when we pray, and we believe that prayer has the power to bring peace to anxious hearts, healing to the sick, strength to the weary, and hope to the hopeless. We invite you to join us as we pray for our church, community, and world.",
  joinSteps: [
    'Download the Church Center App from your phone’s app store.',
    'Open the app and search for Chelsea Community Church.',
    'Select our church, then log in using the email address or phone number connected to your Planning Center profile.',
    'Tap the “Groups” icon at the bottom of the screen.',
    'You’ll find Prayer Team under “Ministry Teams.”',
    'Tap “request to join.”',
  ],
  note: 'Because many of the needs we share are personal or sensitive, we will verify that you are a member or regular attendee of Chelsea Community Church. This helps keep the Prayer Team a safe and private community where hearts can be honest and burdens shared in love. Once your request to join the group is approved, you’ll receive updates and prayer requests via Church Center app notifications — knowing that what’s shared here remains within our circle of prayer.',
};

/* =============================== MEDIA ================================ */

export const media = {
  title: 'Media',
  intro: [
    'Checking us out for the first time or looking to catch up on a Sunday you missed?',
    'Our worship services are streamed live on YouTube each Sunday morning, then uploaded to our channel.',
    'You can also find our sermons in podcast form on all major streaming platforms!',
  ],
};
