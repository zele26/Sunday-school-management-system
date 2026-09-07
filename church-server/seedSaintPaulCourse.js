// church-server/seedSaintPaulCourse.js
const mongoose = require('mongoose');
const EducationCourse = require('./models/education/Course');
const Module = require('./models/education/Module');
const Lesson = require('./models/education/Lesson');
const Quiz = require('./models/education/Quiz');
const Question = require('./models/education/Question');
const Assignment = require('./models/education/Assignment');
const User = require('./models/User');

async function seedSaintPaulCourse() {
  try {
    console.log('🔄 Checking / Seeding "ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ" course into LMS database...');

    // Find or create a default instructor / admin author
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }

    const courseCode = 'THEO-202';
    let course = await EducationCourse.findOne({ 
      $or: [
        { code: courseCode },
        { name: 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ (Saint Paul and Apostolic Ministry)' },
        { name: 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ' }
      ]
    });

    const courseData = {
      code: courseCode,
      name: 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ (Saint Paul and Apostolic Ministry)',
      nameAmharic: 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ',
      description: 'የእግዚአብሔር መገለጥ መሠረተ-ሐሳብ፣ አጠቃላይና ልዩ መገለጥ፣ የመጽሐፍ ቅዱስ እስትንፋሰ እግዚአብሔርነት፣ የቅዱስ ጳውሎስ ሕይወትና ሐዋርያዊ ጉዞዎች እንዲሁም የ14ቱ መልእክታት ጥልቅ ሥነ-መለኮታዊ ትንታኔ።',
      descriptionAmharic: 'የእግዚአብሔር መገለጥ መሠረተ-ሐሳብ፣ አጠቃላይና ልዩ መገለጥ፣ የመጽሐፍ ቅዱስ እስትንፋሰ እግዚአብሔርነት፣ የቅዱስ ጳውሎስ ሕይወትና ሐዋርያዊ ጉዞዎች እንዲሁም የ14ቱ መልእክታት ጥልቅ ሥነ-መለኮታዊ ትንታኔ።',
      studentType: 'distance',
      grade: 'Batch 2',
      semester: 'Semester 1',
      academicYear: '2017 ዓ.ም',
      department: 'ነገረ መለኮት እና የመጽሐፍ ቅዱስ ጥናት',
      ageGroup: 'Adults',
      sequentialProgression: true,
      order: 2,
      bibleTheme: '«የማይታየው ባሕርይ እርሱም የዘላለም ኃይሉ ደግሞም አምላክነቱ ከዓለም ፍጥረት ጀምሮ ከተሠሩት ታውቆ ግልጥ ሆኖ ይታያል» (ሮሜ 1:20)',
      mainBibleVerse: 'ሮሜ 1:20 / 2ጢሞ 3:16',
      lessonDuration: 60,
      numberOfLessons: 18,
      language: 'Amharic',
      learningObjectives: 'የእግዚአብሔርን መገለጥ ምንነት፣ የፍጥረትና የሕሊናን ምስክርነት፣ የመጽሐፍ ቅዱስን እስትንፋሰ መለኮትነት፣ የቅዱስ ጳውሎስን ተጋድሎ እና የ14ቱን መልእክታት አስተምህሮ መረዳት።',
      status: 'active',
      certificateAvailable: true,
      teacher: adminUser ? adminUser._id : null,
    };

    if (!course) {
      course = await EducationCourse.create(courseData);
      console.log(`✅ Created Course: ${course.name} (${course._id})`);
    } else {
      await EducationCourse.updateOne({ _id: course._id }, { $set: courseData });
      console.log(`ℹ️ Course already exists, updated details: ${course.name}`);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6 COMPREHENSIVE PROGRESSIVE MODULES DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────
    const modulesData = [
      {
        order: 1,
        title: 'Module 1: የእግዚአብሔር መገለጥ መሠረተ-ሐሳብ (The Theology of Divine Revelation)',
        titleAmharic: 'ምዕራፍ 1፦ የእግዚአብሔር መገለጥ መሠረተ-ሐሳብ',
        description: 'እግዚአብሔር ራሱን የገለጠበት መንገድ፣ በባሕርይ (οὐσία - Essence) እና በመገለጥ/በሥራው (ἐνέργεια - Energies) መካከል ያለው መሠረታዊ ልዩነት፣ የፀሐይ የሙቀት ንጽጽር እና የቅዱስ ኤፍሬም ሶርያዊ የሰዋዊ አነጋገር (Metaphor) መርህ።',
        descriptionAmharic: 'የእግዚአብሔር መገለጥ ምንነት፣ የሰው ልጅ ውስንነትና የፈጣሪ ወሰን-አልባነት፣ የባሕርይና የመገለጥ ልዩነት።',
        estimatedHours: 4,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllVideos: false,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
          requireAssignmentSubmission: true,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ የእግዚአብሔር መገለጥ ምንነትና አስፈላጊነት',
            titleAmharic: 'የእግዚአብሔር መገለጥ ምንነትና አስፈላጊነት',
            topic: 'የእግዚአብሔር መገለጥ (Revelation of God)',
            objectives: 'የእግዚአብሔርን መገለጥ ምንነት፣ የሰው ልጅ ውስንነትን እና እግዚአብሔር ራሱን ባይገልጥ ኖሮ ልናውቀው የማንችል መሆኑን መረዳት።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['ኢዮብ 11:7', '1ቆሮ 2:11'],
            readingContentAmharic: `### የእግዚአብሔር መገለጥ (Revelation of God)

የእግዚአብሔር መገለጥ ስንል ፈጣሪ እራሱን ለፍጥረቱ በተለይም ለሰዎች የገለጠበት መንገድ እያልን ነው። የአንድ ሃይማኖት መሰረቱ የእግዚአብሔር መገለጥ ነው። እግዚአብሔር ራሱን ባልገለጠበት መልኩ እኛ ልናውቀው አንችልምና።

እግዚአብሔርን በባሕርዩ (οὐσία – essence) የሚያውቀው ማንም የለም። በመጽሐፈ ኢዮብ 11:7 ላይ እንዲህ እንደተባለ፦
> *«የእግዚአብሔርን ጥልቅ ነገር ልትመረምር ትችላለህን? ወይስ ሁሉን የሚችል አምላክን ፈጽመህ ልትመረምር ትችላለህን?»*

ሐዋርያው ቅዱስ ጳውሎስም፦
> *«ከእግዚአብሔር መንፈስ በቀር ለእግዚአብሔር ያለውን ማንም አያውቅም።»* (1ቆሮ 2:11)

በማለት እንደተናገረ ማለት ነው። ስለዚህ **«መገለጥ ማለት በማይወሰነው ኃያል አምላክ እና ውስን በሆነው ሰው መካከል ያለ ግንኙነት ማለት ነው።»**

በዚህ ግንኙነት ውስጥም ውስን የሆነው አካል ሰው ይረዳው እና መገለጡም ፍሬያማ ይሆን ዘንድ የማይወሰነው አካል አምላክ ወርዶ የሚወሰኑ የሆኑ የሰው ቋንቋን እና ሌሎች የመገናኛ ዘዴዎችን ተጠቀመ። መገለጡ ፍሬያማ የሚሆነው በእግዚአብሔርና በሰው መካከል መግባባት ሲኖር ነውና የሰው አቅም በሚችለው መልኩ እግዚአብሔር ወርዶ ራሱን ይገልጣል ማለት ነው ይሉናል አባ ዶክተር ጆሲ ጃኮብ።`,
          },
          {
            order: 2,
            title: 'ትምህርት 2፦ ባሕርይ (Ousia) እና መገለጥ (Energia) - የፀሐይ ንጽጽራዊ ምሳሌ',
            titleAmharic: 'ባሕርይ እና መገለጥ - የፀሐይ ንጽጽራዊ ምሳሌ',
            topic: 'የመለኮታዊ ኃይልና የባሕርይ ልዩነት',
            objectives: 'በመለኮታዊ ባሕርይ እና በመለኮታዊ መገለጥ መካከል ያለውን ልዩነት በፀሐይ ሙቀት ሳይንሳዊና ነገረ-መለኮታዊ ምሳሌ መረዳት።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['1ጢሞ 6:16', 'ዘጸ 33:20'],
            readingContentAmharic: `### እግዚአብሔርን በመገለጡ (ἐνέργεια - energies) ብቻ ማወቅ

እግዚአብሔርን የምናውቀው በመገለጡ (ἐνέργεια - energies) ብቻ ነው። 

**ለምሳሌ፦**
ፀሐይ ምን ያህል ትሞቃለች ብንል ምናልባት እያንዳንዳችን እንዳለንበት አካባቢ 24°C ፣ 35°C እያልን እንመልስ ይሆናል። 
- ውኃን በእሳት ስናፈላ መፍላት የሚጀምረው በ 100°C ነው። 
- 100°C ውኃ የማፍላት ያህል ሙቀት ካለው 1000°C ወይም ደግሞ በጣም ከፍ አድርገን 100,000°C ምን ዓይነት ሙቀት ይኖረው ይሆን..?? 
- የፀሐይ ሙቀት ብለን ያነሳነው ፀሐይ እኛ ጋር የደረሰችበት ወይም ደግሞ እንበለውና ራሷን ለእኛ የገለጠችበት የሙቀት መጠን እንጂ ምናልባት ጠጋ ብንላት በሚያስገርም ሁኔታ ሙቀቷ ከ **15,000,000°C (15 ሚሊዮን ዲግሪ ሴንቲግሬድ)** በላይ እንደሆነ ይነገራል። 

ያው እኛ ግን የምናውቃት ለእኛ በምንችለው መጠን በወረደችበት ወይም በደረሰችበት ሙቀት ያህል ነው። 

እንደዚሁ አምላክ እግዚአብሔርም የሚታወቀው እኛ በምንችለው ልክ እራሱን በገለጠው ልክ ነው። ፀሐይ ለእኛ የተገለጠችበትን የሙቀት መጠን ይዘን የፀሐይ ትክክለኛው ሙቀትም ይኼው ነው ብለን እንደማንወስን እንዲሁ ደግሞ እግዚአብሔር እኛ በምንረዳው ልክ ዝቅ ብሎ ሲገለጥልን በዚህ መገለጥ ልንወስነው አንችልም።

ይህም ማለት ለእግዚአብሔር የተነገሩ ቃላትን ሁሉ ለባሕርዩ ሰጥተን ልንናገር አይገባም። ለዛም ነው **ቅዱስ ኤፍሬም ሶርያዊ** እንዲህ ያለው፦
> *«ምናልባት አንድ ሰው ስለ እግዚአብሔር የተነገረበት ሰዋዊ አነጋገር (Metaphor) ላይ ብቻ ትኩረት የሚያደርግ ከሆነ ይህንን ጌታ በተሳሳተ መልኩ በመግለጽ ይስታል።»* (St. Ephrem the Syrian: Hymns on Paradise, 11:6)`,
          }
        ],
        quiz: {
          title: 'የምዕራፍ 1 ማረጋገጫ ፈተና (Module 1 Quiz: Divine Revelation)',
          passingMark: 75,
          duration: 15,
          questions: [
            {
              questionText: 'እግዚአብሔር ራሱን ባልገለጠበት መልኩ የሰው ልጅ በራሱ አቅም ሊያውቀው ይችላል?',
              options: ['አዎ በፍልስፍና ጥናት', 'አይችልም፤ የእምነት መሠረቱ የእግዚአብሔር መገለጥ ነው', 'በተፈጥሮ ምርምር ብቻ ይቻላል', 'በተወሰነ ደረጃ በሰው ብልሃት ይቻላል'],
              correctOptionIndex: 1,
              explanation: 'እግዚአብሔር ራሱን ባልገለጠበት መልኩ ማንም ሊያውቀው አይችልም። ኢዮብ 11:7 እንዳስረዳው ፈጣሪ በባሕርዩ የማይመረመር ነው።',
            },
            {
              questionText: '«οὐσία (Ousia)» እና «ἐνέργεια (Energia)» የሚያመለክቱት በቅደም ተከተል ምንድን ነው?',
              options: ['ፍጥረት እና ፈጣሪ', 'መለኮታዊ ባሕርይ (Essence) እና መለኮታዊ ሥራ/መገለጥ (Energies)', 'ብሉይ ኪዳን እና ሐዲስ ኪዳን', 'ጸሎት እና ምጽዋት'],
              correctOptionIndex: 1,
              explanation: 'ኦውሲያ የእግዚአብሔር መለኮታዊ ባሕርይ ሲሆን ኤነርጂያ ደግሞ ለእኛ የተገለጠበት መለኮታዊ ሥራውና ኃይሉ ነው።',
            },
            {
              questionText: 'ቅዱስ ኤፍሬም ሶርያዊ በ Hymns on Paradise 11:6 ላይ ያስጠነቀቀው ስለምንድን ነው?',
              options: ['መጽሐፍ ቅዱስን እንዳናነብ', 'ስለ እግዚአብሔር የተነገሩ ሰዋዊ አነጋገሮች (Metaphors) ላይ ብቻ ተመስርቶ መሳሳትን', 'ፀሐይን ከመመልከት', 'ከአሕዛብ ጋር ከመነጋገር'],
              correctOptionIndex: 1,
              explanation: 'እግዚአብሔርን በሰውኛ ቋንቋ ዝቅ ብሎ በመገለጡ የተነገሩ ሰዋዊ አነጋገሮችን የባሕርይው መገለጫ አድርጎ መውሰድ ስህተት እንደሆነ አስጠንቅቋል።',
            }
          ]
        },
        assignment: {
          title: 'የምዕራፍ 1 የጽሑፍ ጥናት (Assignment 1: Essence vs. Energies in Orthodox Theology)',
          description: 'የፀሐይን ምሳሌ እና የቅዱስ ኤፍሬም ሶርያዊን መርህ መሠረት በማድረግ «እግዚአብሔር በባሕርዩና በመገለጡ እንዴት ይታወቃል?» በሚለው ርእስ ከ 400-600 ቃላት የተዋቀረ አጭር የነገረ መለኮት ጽሑፍ አዘጋጅተው ያስገቡ።',
          maxScore: 100,
        }
      },
      {
        order: 2,
        title: 'Module 2: አጠቃላይ መገለጥ እና የፍጥረት ምስክርነት (General Revelation)',
        titleAmharic: 'ምዕራፍ 2፦ አጠቃላይ መገለጥ እና የፍጥረት ምስክርነት',
        description: 'እግዚአብሔር በፈጠረው ሰው ሕሊና (ሮሜ 2:14-16)፣ በሥነ-ፍጥረት ሥርዓት (ሮሜ 1:20፣ መዝ 19:1) እና በጥበብ ራሱን የገለጠበት አጠቃላይ መንገድና ወሰኑ።',
        descriptionAmharic: 'የሕሊና ሕግ፣ የሥነ-ፍጥረት ምስክርነት እና የአጠቃላይ መገለጥ ወሰን።',
        estimatedHours: 4,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ አጠቃላይ መገለጥ (General Revelation) እና የሰው ልጅ ሕሊና',
            titleAmharic: 'አጠቃላይ መገለጥ እና የሰው ልጅ ሕሊና',
            topic: 'የሕሊና ሕግ በእያንዳንዱ ሰው ልብ',
            objectives: 'በዘፍ 1:26 እና ሮሜ 2:14-16 መሠረት እግዚአብሔር በሰው ልጆች ሕሊና ውስጥ ያስቀመጠውን የሕግ ሥራ መረዳት።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['ዘፍ 1:26', 'ሮሜ 2:14-16', 'ሮሜ 1:20', 'መዝ 19:1', 'ጥበብ 9:1'],
            readingContentAmharic: `### አጠቃላይ መገለጥ (General Revelation)

ይህ መገለጥ እግዚአብሔር በፈጠረው በሰው እና በሌሎች ፍጥረቱ የሚገለጥበት መንገድ ነው።

**1. በሰው ልጅ ውስጥ ያለው መገለጥ፦**
በዘፍ 1፡26 *«ሰውን በመልካችን እንደ ምሳሌአችን እንፍጠር»* ያለ አምላክ በራሱ አምሳል በፈጠረው ሰው ውስጥ ሊገለጥ ይችላል። 
ለምሳሌ በሰዎች ያለው ሕሊና ክፉና ደጉን መለየቱ ይህም በእያንዳንዱ ሰው ልብ ውስጥ የተቀመጠ ሕገ እግዚአብሔር ነው። 

ሐዋርያው ጳውሎስ በሮሜ 2፡14-16 እንዲህ ይላል፦
> *«ሕግ የሌላቸው አሕዛብ ከባሕርያቸው የሕግን ትእዛዝ ሲያደርጉ፥ እነዚያ ሕግ ባይኖራቸው እንኳ ለራሳቸው ሕግ ናቸውና፤ እነርሱም ሕሊናቸው ሲመሰክርላቸው፥ አሳባቸውም እርስ በርሳቸው ሲካሰስ ወይም ሲያመካኝ በልባቸው የተጻፈውን የሕግ ሥራ ያሳያሉ።»*

ስለዚህም በሰዎች ውስጥ የሚኖረው መልካም ነገር ሁሉ የአምላክን መገለጫ የሚያሳይ ነው። ሰው እንዲሁ ማየቱ መስማቱም ምንም እንኳን በሰው መልኩ ባይሆንም እግዚአብሔርንም በባሕርዩ ሁሉን ማየትና መስማት እንደሚችል ያሳያል።

**2. በሥነ-ፍጥረት ውስጥ ያለው መገለጥ፦**
በሌሎቹም ሥነ ፍጥረቱ እንዲሁ ካለመኖር ወደ መኖር ያመጣ ነውና በእነዚህ ፍጥረታት እግዚአብሔር ከሁሉ በላይ የሁሉ ፈጣሪ መሆኑ መታወቂያው ይሆናል። 

- ሰለሞን በጥበቡ፦ *«ሥራውንም እያዩ ሠሪውን አላወቁም»* (ጥበብ 9፡1) በማለት እንደተናገረ ሠሪው ከሥራውም ይታወቃልና ነው። 
- ይህንን የሰለሞንን ንግግር በመያዝ ሐዋርያው ቅዱስ ጳውሎስም እንዲህ እንዳለ፦ 
  > *«የማይታየው ባሕርይ እርሱም የዘላለም ኃይሉ ደግሞም አምላክነቱ ከዓለም ፍጥረት ጀምሮ ከተሠሩት ታውቆ ግልጥ ሆኖ ይታያልና…»* (ሮሜ 1፡20)
- መዝሙረኛውም እንዲህ እንዳለ፦ 
  > *«ሰማያት የእግዚአብሔርን ክብር ይናገራሉ፥ የሰማይም ጠፈር የእጁን ሥራ ያወራል።»* (መዝ 19፡1)

> ⚠️ **ዋና ማስታወሻ፦** ይህ አጠቃላይ መገለጥ ስለ እግዚአብሔር የተወሰነ ያሳውቀን እንጂ በቀጥታ ወደ ድኅነት (Salvation) የሚመራ ግን አይደለም።`,
          }
        ],
        quiz: {
          title: 'የምዕራፍ 2 ማረጋገጫ ፈተና (Module 2 Quiz: General Revelation)',
          passingMark: 75,
          duration: 15,
          questions: [
            {
              questionText: 'በሮሜ 2:14-16 መሠረት የተጻፈ ሕግ ላልነበራቸው አሕዛብ ምስክር ሆኖ የተሰጠው ምንድን ነው?',
              options: ['የፈላስፎች መጽሐፍ', 'በልባቸው የተጻፈው የሕሊና ሕግ', 'የንግድ ሥርዓታቸው', 'የወታደራዊ ኃይላቸው'],
              correctOptionIndex: 1,
              explanation: 'ቅዱስ ጳውሎስ እንዳስረዳው ሕሊናቸው እየመሰከረ በልባቸው የተጻፈውን የሕግ ሥራ ያሳያሉ።',
            },
            {
              questionText: 'በሮሜ 1:20 መሠረት ከዓለም ፍጥረት ጀምሮ ግልጽ ሆኖ የሚታየው የእግዚአብሔር ባሕርይ ምንድን ነው?',
              options: ['ሥጋዊ መልኩ', 'የዘላለም ኃይሉና አምላክነቱ', 'የፈጠራቸው ከተሞች', 'ምድራዊ ንግሥናው'],
              correctOptionIndex: 1,
              explanation: 'የማይታየው ባሕርዩ እርሱም የዘላለም ኃይሉና አምላክነቱ ከሥነ ፍጥረት ተደላድሎ ታውቆ ይታያል።',
            },
            {
              questionText: 'አጠቃላይ መገለጥ ሰውን ወደ ሙሉ ድኅነት ያደርሳል?',
              options: ['አዎ ሙሉ በሙሉ ያድናል', 'አያደርስም፤ የፈጣሪን መኖር ቢያሳውቅም ወደ ልዩ መገለጥና ድኅነት መሸጋገር ያስፈልጋል', 'ከነቢያት መገለጥ የበለጠ ነው', 'በምድር ላይ ብቻ የተወሰነ ነው'],
              correctOptionIndex: 1,
              explanation: 'አጠቃላይ መገለጥ ፈጣሪን ቢያሳውቅም የድኅነትን ምስጢር (ሥጋዌ፣ ጥምቀት፣ ቁርባን) ስለማይገልጥ ወደ ልዩ መገለጥ መምጣት ግድ ነው።',
            }
          ]
        }
      },
      {
        order: 3,
        title: 'Module 3: ልዩ መገለጥ፣ ቅዱስ ትውፊት እና እስትንፋሰ እግዚአብሔር (Special Revelation & Scripture)',
        titleAmharic: 'ምዕራፍ 3፦ ልዩ መገለጥ፣ ቅዱስ ትውፊት እና እስትንፋሰ እግዚአብሔር',
        description: 'ልዩ መገለጥ (በነቢያትና በወልደ እግዚአብሔር ሥጋዌ)፣ የነገረ መለኮት ሁለት ዋና ምንጮች (ቅዱስ ትውፊት እና መጽሐፍ ቅዱስ)፣ የእስትንፋሰ እግዚአብሔርነት ምስጢር (θεόπνευστος) እና የመጽሐፍ ቅዱስ አሰባሰብ ታሪክ።',
        descriptionAmharic: 'ልዩ መገለጥ፣ ቅዱስ ትውፊት፣ የእስትንፋሰ እግዚአብሔርነት ምንነት እና የመጽሐፍ ቅዱስ ታሪክ።',
        estimatedHours: 5,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ ልዩ መገለጥ (Special Revelation) እና የነገረ መለኮት ምንጮች',
            titleAmharic: 'ልዩ መገለጥ እና የነገረ መለኮት ምንጮች',
            topic: 'ቅዱስ ትውፊት እና መጽሐፍ ቅዱስ',
            objectives: 'የልዩ መገለጥን ምንነት፣ በነቢያትና በክርስቶስ ሰው መሆን የተፈጸመውን ድኅነት፣ እንዲሁም የቅዱስ ትውፊትና የመጽሐፍ ቅዱስን አንድነት መረዳት።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['2ጢሞ 3:16', '2ጴጥ 1:21', '2ሳሙ 23:1-2', 'መዝ 45:1'],
            readingContentAmharic: `### ልዩ መገለጥ (Special Revelation)

ይህ ወደ ድኅነት የሚመራ መገለጥ ደግሞ እግዚአብሔር ራሱን ለሕዝቡ ቀጥታ በተለያየ መልኩ በሕልም ወይም በመልአክ በኩል፣ በነቢያት በኩል የገለጠበት በኋላም ደግሞ የመጨረሻውና ትልቁ መገለጡን በልጁ ሥጋዌ በኩል ያደረገበት መንገድ ነው። 

ይህንን ልዩ መገለጥ የምናገኘው ደግሞ በ **ቅዱስ ትውፊት (Sacred Tradition)** እና በ **መጽሐፍ ቅዱስ** ነው። ለነገረ መለኮትም ዋና ምንጮቻችን እነሱ (መጽሐፍ ቅዱስና ትውፊት) ናቸው።

---

### መጽሐፍ ቅዱስ እና የእግዚአብሔር እስትንፋስ (θεόπνευστος)

በዓለማችን ላይ ምናልባት ብዙ መጽሐፍትን እናውቅ ይሆናል። የልቦለድ፣ የታሪክ፣ የፍልስፍና፣ የጥንቆላ እና ሌሎችም። ታዲያ ግን ከእነዚህ እና ከመሰሎቻቸው መጽሐፍት ሁሉ ተለይቶ **«ቅዱስ»** ተብሎ የሚጠራ መጽሐፍ አለ እርሱም እስትንፋሰ እግዚአብሔር የሆነው ቅዱሱ መጽሐፋችን ነው።

ቅዱስ የተባለውም ምንም እንኳን ቅዱሳን ሰዎች ቢጽፉትም በመንፈስ ቅዱስ ተመርተው ነውና ባለቤቱ ራሱ ቅዱሱ አምላካችን እግዚአብሔር በመሆኑ ነው። 

- መዝሙረኛው ዳዊት፦ *«አንደበቴ እንደ ፈጣን ጸሐፊ ብርዕ ነው»* እንዲል (መዝሙር 45:1) አንደበቱ ብርዕ ከሆነ ጸሐፊው አምላክ ነውና ነው። እግዚአብሔር ቃሉን በአንደበቱ ያስቀምጣል በእርሱም በኩል ይናገራል ማለት ነው። 
- ለዛም ነው በ 2ሳሙ 23፡1-2 እንዲህ የሚለው፦ *«የእሴይ ልጅ የዳዊት ንግግር፤ የእግዚአብሔር መንፈስ በእኔ ተናገረ፤ ቃሉም በአንደበቴ ላይ ነበረ።»*
- ጴጥሮስም በተመሳሳይ እንዲህ ይለናል፦ *«ትንቢት ከቶ በሰው ፈቃድ አልመጣምና፥ ዳሩ ግን በእግዚአብሔር ተልከው ቅዱሳን ሰዎች በመንፈስ ቅዱስ ተነድተው ተናገሩ።»* (2ጴጥ 1፡21)
- ሐዋርያው ጳውሎስ ደግሞ በ 2ጢሞ 3፡16፦ 
  > *«የእግዚአብሔር መንፈስ (θεόπνευστος - Theopneustos) ያለበት መጽሐፍ ሁሉ ለትምህርትና ለተግሣጽ ልብንም ለማቅናት በጽድቅም ላለው ምክር ደግሞ ይጠቅማል።»* 
  በማለት እስትንፋሰ እግዚአብሔር እንደሆነ ያስረዳል።

---

### የመጽሐፍ ቅዱስ ታሪካዊ አመጣጥ

ይህ ታላቁ የእግዚአብሔር ቃል ቅዱሱ መጽሐፍ ሁለት ታላላቅ ክፍሎች ሲኖሩት እነሱም **ብሉይ ኪዳን** እና **ሐዲስ ኪዳን** ናቸው። 
- ጌታችን ኢየሱስ ክርስቶስ ከድንግል ማርያም ሰው ሆኖ ከመምጣቱ በፊት የተጻፉት የብሉይ ኪዳን መጻሕፍት ሲባሉ 
- ከጌታ ከድንግል መወለድ በኋላ ደግሞ በጌታ ደቀመዛሙርት የተጻፉት እነርሱ የሐዲስ ኪዳን መጻሕፍት ተብለው ይታወቃሉ።

መጽሐፍ ቅዱሱ አንድ ወጥ መጽሐፍ ሳይሆን በውስጡ ያሉ መጽሐፍት እያንዳንዳቸው ራሳቸውን ችለው የተጻፉ መጻሕፍት ናቸው። እነዚህም በቀደመው ዘመን በጥቅልል (Scrolls) ሆነው ይጻፉና ይቀመጡ ነበር። 

መጽሐፍ ቅዱስ እንዲህ በአንድነት ተጠርዞ ለሕትመት የበቃው የሕትመት ቴክኖሎጂው ከመጣ በኋላ ሲሆን ይህም በ **15ኛው ክፍለ ዘመን አጋማሽ** የተጀመረ ነው። በውስጡ የተለያዩ መጻሕፍት አሉ ካልን ደግሞ የተለያዩ ጸሐፍያንም አሉ እያልን እንደሆነ ግልጽ ነው። ለምሳሌ የማቴዎስ ወንጌል አንድ መጽሐፍ ሲሆን ጸሐፊውም ማቴዎስ ነው። የሉቃስ ወንጌልም ስንል እንዲሁ። በአጠቃላይ ከ **40 በላይ በሚሆኑ ቅዱሳን ሰዎች** የተጻፈ ነው።`,
          }
        ],
        quiz: {
          title: 'የምዕራፍ 3 ማረጋገጫ ፈተና (Module 3 Quiz: Scripture & Inspiration)',
          passingMark: 75,
          duration: 15,
          questions: [
            {
              questionText: 'በ 2ጢሞ 3:16 ላይ የተጠቀሰው የግሪክ ቃል «θεόπνευστος (Theopneustos)» ትርጉም ምንድን ነው?',
              options: ['የሰዎች ጥበብ ውጤት', 'የእግዚአብሔር እስትንፋስ ያለበት (God-breathed)', 'የታሪክ መዝገብ', 'የቀደመ ልማድ'],
              correctOptionIndex: 1,
              explanation: 'ቴዎፕኔውስቶስ ማለት የእግዚአብሔር እስትንፋስ ያለበት / በመንፈስ ቅዱስ የተጻፈ ማለት ነው።',
            },
            {
              questionText: 'መጽሐፍ ቅዱስ በአጠቃላይ በስንት ቅዱሳን ጸሐፊዎች ተጻፈ?',
              options: ['በ 12 ሐዋርያት ብቻ', 'በ 4 ወንጌላውያን ብቻ', 'ከ 40 በላይ በሚሆኑ ቅዱሳን ሰዎች', 'በ 70 ሊቃናት ብቻ'],
              correctOptionIndex: 2,
              explanation: 'መጽሐፍ ቅዱስ ከ 40 በላይ በሚሆኑ ቅዱሳን ጸሐፊዎች ከ1600 ዓመታት በላይ በሆነ ጊዜ ውስጥ ተጽፏል።',
            },
            {
              questionText: 'መጽሐፍ ቅዱስ በአንድ ጥራዝ ተጠርዞ በሕትመት ቴክኖሎጂ መታተም የጀመረው መቼ ነው?',
              options: ['በ 1ኛው ክ/ዘመን', 'በ 15ኛው ክ/ዘመን አጋማሽ', 'በ 20ኛው ክ/ዘመን', 'በ 4ኛው ክ/ዘመን'],
              correctOptionIndex: 1,
              explanation: 'የሕትመት ቴክኖሎጂ (Gutenberg Press) ከመጣ በኋላ በ15ኛው ክፍለ ዘመን አጋማሽ በአንድነት ታተመ።',
            }
          ]
        }
      },
      {
        order: 4,
        title: 'Module 4: የቅዱስ ጳውሎስ ሕይወት፣ ጥሪ እና ሐዋርያዊ ጉዞዎች (Life & Journeys of St. Paul)',
        titleAmharic: 'ምዕራፍ 4፦ የቅዱስ ጳውሎስ ሕይወት፣ ጥሪ እና ሐዋርያዊ ጉዞዎች',
        description: 'የሳኦል የቀድሞ ሕይወት፣ የደማስቆ ጥሪና ለውጥ፣ ሦስቱ ሐዋርያዊ ጉዞዎች፣ የኢየሩሳሌም ሲኖዶስ እና በሮም የተፈጸመው ሰማዕትነት።',
        descriptionAmharic: 'የቅዱስ ጳውሎስ ጥሪ፣ ጉዞዎች፣ ስብከት እና ሰማዕትነት።',
        estimatedHours: 5,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ የጠርሴሱ ሳኦል እና የደማስቆው ተአምራዊ ጥሪ',
            titleAmharic: 'የጠርሴሱ ሳኦል እና የደማስቆው ተአምራዊ ጥሪ',
            topic: 'የቅዱስ ጳውሎስ ጥሪ',
            objectives: 'የቅዱስ ጳውሎስን የቀድሞ ማንነትና በደማስቆ መንገድ ላይ የተገለጠለትን መለኮታዊ ብርሃን መመርመር።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['የሐዋ 9:1-22', 'የሐዋ 22:3', 'ፊል 3:4-8'],
            readingContentAmharic: `### የቅዱስ ጳውሎስ ሕይወትና ጥሪ

ቅዱስ ጳውሎስ በቀድሞ ስሙ **ሳኦል** ይባል ነበር። የተወለደው በኪልቅያ በምትገኝ በጠርሴስ ከተማ ሲሆን የሮም ዜግነት ነበረው። በታላቁ የአይሁድ መምህር **በገማልያል** እግር ሥር ተቀምጦ የኦሪትን ሕግ በጥልቅ የተማረ ፈሪሳዊ ነበር (የሐዋ 22:3)።

በቀናተኛነቱ ምክንያት የቀደመችውን የክርስቶስ ቤተክርስቲያን ያሳድድ፣ ምእመናንን ያስርና ይገርፍ ነበር። ቅዱስ እስጢፋኖስ በድንጋይ ተወግሮ ሲገደል ልብሳቸውን ይጠብቅ የነበረው ሳኦል ነበር (የሐዋ 7:58)።

---

### የደማስቆው መለኮታዊ ጥሪ (The Damascus Experience)

ሳኦል በደማስቆ ያሉ ክርስቲያኖችን አስሮ ወደ ኢየሩሳሌም ለማምጣት በደብዳቤ ተፈቅዶለት ሲጓዝ ቀትር ሲሆን ከሰማይ የወረደ ታላቅ ብርሃን በዙሪያው አበራ። በምድር ላይ ወድቆ ሳለ፦
> *«ሳኦል സാኦል፥ ስለ ምን ታሳድደኛለህ?»* 

የሚል ድምፅ ሰማ። ሳኦልም *«ጌታ ሆይ፥ ማን ነህ?»* ባለ ጊዜ፦
> *«እኔ አንተ የምታሳድደኝ ኢየሱስ ነኝ፤ የመውጊያውን ብረት ብትቃወም ለአንተ ይብስብሃል»* (የሐዋ 9:4-5)

የሚል አስፈሪና አዳኝ መልስ ተሰጠው። ሳኦል ዓይኖቹ ታውረው ለሦስት ቀናት ሳይበላና ሳይጠጣ ከቆየ በኋላ እግዚአብሔር በላከው በሐናንያ እጅ ተጠምቆ ዓይኑ በራለት፣ መንፈስ ቅዱስንም ተሞላ። ከዚያን ጊዜ ጀምሮ ሳኦል ወደ ታላቁ የዓለም ሐዋርያ ወደ **ቅዱስ ጳውሎስ** ተለወጠ።`,
          }
        ],
        quiz: {
          title: 'የምዕራፍ 4 ማረጋገጫ ፈተና (Module 4 Quiz: Paul’s Life & Ministry)',
          passingMark: 75,
          duration: 15,
          questions: [
            {
              questionText: 'ቅዱስ ጳውሎስ የኦሪትን ሕግ የተማረው በማን እግር ሥር ተቀምጦ ነው?',
              options: ['በቀያፋ', 'በገማልያል', 'በኒቆዲሞስ', 'በአሪስጣርኮስ'],
              correctOptionIndex: 1,
              explanation: 'ቅዱስ ጳውሎስ በታላቁ አይሁዳዊ መምህር በገማልያል እግር ሥር ተምሯል (የሐዋ 22:3)።',
            },
            {
              questionText: 'ቅዱስ ጳውሎስ በደማስቆ መንገድ ላይ በወደቀ ጊዜ የተጠመቀው በማን እጅ ነው?',
              options: ['በጴጥሮስ', 'በሐናንያ', 'በበርናባስ', 'በሉቃስ'],
              correctOptionIndex: 1,
              explanation: 'እግዚአብሔር በራእይ የላከው ሐናንያ በደማስቆ አጥምቆታል (የሐዋ 9:10-18)።',
            }
          ]
        }
      },
      {
        order: 5,
        title: 'Module 5: የቅዱስ ጳውሎስ መልእክታት ሥነ-መለኮት (Theology of the 14 Pauline Epistles)',
        titleAmharic: 'ምዕራፍ 5፦ የቅዱስ ጳውሎስ መልእክታት ሥነ-መለኮት',
        description: 'የ 14ቱ የቅዱስ ጳውሎስ መልእክታት አከፋፈል፣ ዋና ዋና ሥነ-መለኮታዊ ትምህርቶች (ነገረ ድኅነት፣ ነገረ ክርስቶስ፣ ነገረ ቤተክርስቲያን እና ክርስቲያናዊ ሥነ ምግባር)።',
        descriptionAmharic: 'የ14ቱ መልእክታት ሥነ-መለኮታዊ ትንታኔ እና ምደባ።',
        estimatedHours: 5,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ የ 14ቱ የቅዱስ ጳውሎስ መልእክታት ሥነ-መለኮታዊ ምደባ',
            titleAmharic: 'የ 14ቱ የቅዱስ ጳውሎስ መልእክታት ሥነ-መለኮታዊ ምደባ',
            topic: 'የጳውሎስ መልእክታት ይዘት',
            objectives: 'የ 14ቱን መልእክታት ይዘት በዋና ዋና የነገረ መለኮት ጭብጦች መክፈልና መረዳት።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['ሮሜ 1-16', '1ቆሮ 13', 'ኤፌ 2', 'ዕብ 1-13'],
            readingContentAmharic: `### የ 14ቱ መልእክታት አከፋፈል

ሐዋርያው ቅዱስ ጳውሎስ የጻፋቸው 14ቱ መልእክታት በአራት ዋና ዋና ክፍሎች ይመደባሉ፦

1. **ዋና ዋና የነገረ መለኮት መልእክታት (Major Doctrinal Epistles)፦**
   - **ሮሜ እና ገላትያ፦** ስለ እምነት፣ ጸጋ እና ስለ ሕግ አሠራር የሚተነትኑ።
   - **1ኛ እና 2ኛ ቆሮንቶስ፦** ስለ ቤተክርስቲያን አንድነት፣ የክርስቶስ አካልነት፣ ስለ ፍቅር (1ቆሮ 13) እና ስለ ትንሣኤ ሙታን (1ቆሮ 15) የሚያስተምሩ።

2. **የመጀመሪያዎቹ መልእክታት (Early Epistles)፦**
   - **1ኛ እና 2ኛ ተሰሎንቄ፦** ስለ ጌታችን ዳግም ምጽአትና ስለ ክርስቲያናዊ ተስፋ።

3. **የእስር ቤት መልእክታት (Prison Epistles)፦**
   - **ኤፌሶን፣ ፊልጵስዩስ፣ ቆላስይስ፣ ፊልሞና፦** ቅዱስ ጳውሎስ በሮም እስር ቤት ሆኖ የጻፋቸው ሲሆኑ ስለ ክርስቶስ ራስነት እና ስለ ቤተክርስቲያን ክብር በጥልቅ ያትታሉ።

4. **የአስተዳደር/የፓስተራል መልእክታት (Pastoral Epistles) እና ዕብራውያን፦**
   - **1ኛ እና 2ኛ ጢሞቴዎስ፣ ቲቶ፦** ለአብያተ ክርስቲያናት መሪዎች ስለ ክህነት ሥርዓት፣ ስለ ንጽሕና እና ስለ ትምህርት ጥበቃ የተጻፉ።
   - **ዕብራውያን፦** ስለ ክርስቶስ ዘላለማዊ ሊቀ-ካህንነት እና የሐዲስ ኪዳን መሥዋዕት የበላይነት የሚያብራራ ድንቅ መጽሐፍ።`,
          }
        ],
        quiz: {
          title: 'የምዕራፍ 5 ማረጋገጫ ፈተና (Module 5 Quiz: Pauline Epistles)',
          passingMark: 75,
          duration: 15,
          questions: [
            {
              questionText: 'ከሚከተሉት ውስጥ የቅዱስ ጳውሎስ የእስር ቤት መልእክት (Prison Epistle) የሆነው የቱ ነው?',
              options: ['ገላትያ', 'ኤፌሶን', '1ኛ ተሰሎንቄ', 'ሮሜ'],
              correctOptionIndex: 1,
              explanation: 'ኤፌሶን፣ ፊልጵስዩስ፣ ቆላስይስ እና ፊልሞና የእስር ቤት መልእክታት ይባላሉ።',
            },
            {
              questionText: 'ስለ ክርስቶስ ዘላለማዊ ሊቀ-ካህንነት በስፋት የሚያትተው መልእክት የትኛው ነው?',
              options: ['መልእክተ ዕብራውያን', 'መልእክተ ፊልሞና', '1ኛ ጢሞቴዎስ', 'ቲቶ'],
              correctOptionIndex: 0,
              explanation: 'መልእክተ ዕብራውያን የክርስቶስን ሊቀ-ካህንነት እንደ መልከ ጼዴቅ ሥርዓት ያብራራል።',
            }
          ]
        }
      },
      {
        order: 6,
        title: 'Module 6: ሐዋርያዊ አገልግሎት በዘመናችን እና ማጠቃለያ ፈተና (Contemporary Ministry & Final Exam)',
        titleAmharic: 'ምዕራፍ 6፦ ሐዋርያዊ አገልግሎት በዘመናችን እና ማጠቃለያ ፈተና',
        description: 'የቅዱስ ጳውሎስን አርአያነት በዘመናችን አገልግሎት መተግበር፣ የመጨረሻው የኮርስ ማጠቃለያ ጥናት እና አጠቃላይ የፈተና ምዘና።',
        descriptionAmharic: 'የዘመናችን ሐዋርያዊ አገልግሎት እና የኮርሱ ማጠቃለያ ፈተና።',
        estimatedHours: 6,
        mandatoryActivities: {
          requireAllLessons: true,
          requireAllReadings: true,
          requireQuizPassing: true,
          minQuizScorePct: 75,
          requireAssignmentSubmission: true,
        },
        lessons: [
          {
            order: 1,
            title: 'ትምህርት 1፦ ሐዋርያዊ አገልግሎት እና የወንጌል አደራ በዘመናችን',
            titleAmharic: 'ሐዋርያዊ አገልግሎት እና የወንጌል አደራ በዘመናችን',
            topic: 'የዘመናችን ሐዋርያዊነት',
            objectives: 'የቅዱስ ጳውሎስን የአገልግሎት ጽናት፣ ደቀመዛሙርትን የማፍራት ጥበብ በሰንበት ትምህርት ቤት አገልግሎት መተግበር።',
            readingEstimatedMinutes: 15,
            isReadingMandatory: true,
            bibleReferences: ['2ጢሞ 4:1-8', '1ቆሮ 9:16-23'],
            readingContentAmharic: `### ሐዋርያዊ አገልግሎት በዘመናችን

ቅዱስ ጳውሎስ በ 2ጢሞ 4:7 ላይ፦
> *«መልካሙን ገድል ተጋድያለሁ፥ ሩጫውን ጨርሻለሁ፥ ሃይማኖትን ጠብቄአለሁ፤ ወደ ፊት የጽድቅ አክሊል ተዘጋጅቶልኛል»*

በማለት እንዳስተማረን፣ እያንዳንዱ ክርስቲያን በተሰጠው ጸጋና የአገልግሎት ድርሻ የቤተክርስቲያን አገልጋይ ነው። 

በዚህ ኮርስ የተማርናቸውን፦
1. የእግዚአብሔርን መገለጥ ምስጢር
2. የሕሊና እና የፍጥረትን ምስክርነት
3. የመጽሐፍ ቅዱስን እስትንፋሰ መለኮትነት
4. የቅዱስ ጳውሎስን የመስዋዕትነት አገልግሎት

በሕይወታችን፣ በሰንበት ትምህርት ቤታችንና በማኅበራዊ አገልግሎታችን ተግባራዊ ማድረግ የሁላችንም ክርስቲያናዊ አደራ ነው።`,
          }
        ],
        quiz: {
          title: 'የኮርሱ ማጠቃለያ አጠቃላይ ፈተና (Comprehensive Final Course Examination)',
          quizType: 'Final Exam',
          passingMark: 75,
          duration: 30,
          questions: [
            {
              questionText: 'የእግዚአብሔርን መገለጥ (Revelation) በሁለት ዋና ክፍሎች ስንከፍለው ምን እና ምን ይባላሉ?',
              options: ['አጠቃላይ መገለጥ እና ልዩ መገለጥ', 'የብሉይ ኪዳን እና የሐዲስ ኪዳን መገለጥ', 'የሰማይ እና የምድር መገለጥ', 'የቃል እና የተግባር መገለጥ'],
              correctOptionIndex: 0,
              explanation: 'የእግዚአብሔር መገለጥ በዋናነት አጠቃላይ መገለጥ (General) እና ልዩ መገለጥ (Special) ተብሎ ይከፈላል።',
            },
            {
              questionText: 'የሰው ልጅ ሕሊና እና ሥነ-ፍጥረት የሚመደቡት በየትኛው የመገለጥ ክፍል ሥር ነው?',
              options: ['በልዩ መገለጥ ሥር', 'በአጠቃላይ መገለጥ ሥር', 'በምስጢራተ ቤተክርስቲያን ሥር', 'በተዓምራት ሥር'],
              correctOptionIndex: 1,
              explanation: 'ሕሊና እና ሥነ-ፍጥረት እግዚአብሔር ለሰው ልጆች ሁሉ የገለጠባቸው አጠቃላይ መገለጦች ናቸው።',
            },
            {
              questionText: 'የእግዚአብሔር ባሕርይ (οὐσία) በሰው አእምሮ ሙሉ በሙሉ ሊመረመር አይችልም፤ የምናውቀው በምን ብቻ ነው?',
              options: ['በፍልስፍና ብቻ', 'በገለጠው መገለጥና በሥራው (ἐνέργεια) ብቻ', 'በሳይንሳዊ ስሌት', 'በህልም ብቻ'],
              correctOptionIndex: 1,
              explanation: 'እግዚአብሔር በባሕርዩ የማይመረመር ሲሆን ለእኛ በወረደበት እና በገለጠው መገለጡ (Energies) ብቻ ይታወቃል።',
            },
            {
              questionText: 'ቅዱስ ጳውሎስ በድምሩ ስንት መልእክታትን በመንፈስ ቅዱስ ተመርቶ ጽፏል?',
              options: ['12 መልእክታት', '14 መልእክታት', '7 መልእክታት', '4 መልእክታት'],
              correctOptionIndex: 1,
              explanation: 'ሐዋርያው ቅዱስ ጳውሎስ 14 መልእክታትን ጽፏል።',
            }
          ]
        },
        assignment: {
          title: 'የማጠቃለያ የምርምር ፕሮጀክት (Final Course Project: Pauline Ministry in Modern Age)',
          description: 'ከ 14ቱ የቅዱስ ጳውሎስ መልእክታት መካከል አንዱን መርጠው የመልእክቱን ታሪካዊ ዳራ፣ ዋና የነገረ መለኮት አስተምህሮ እና ለዘመናችን ወጣቶች የሚሰጠውን ተግባራዊ መመሪያ በ 3 ገጽ አዘጋጅተው ያስገቡ።',
          maxScore: 100,
        }
      }
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // SAVE MODULES, LESSONS, QUIZZES & ASSIGNMENTS IN SEQUENCE
    // ──────────────────────────────────────────────────────────────────────────
    let prevModuleId = null;

    for (const mData of modulesData) {
      let moduleDoc = await Module.findOne({ courseId: course._id, order: mData.order });
      
      const moduleFields = {
        title: mData.title,
        titleAmharic: mData.titleAmharic,
        description: mData.description,
        descriptionAmharic: mData.descriptionAmharic,
        courseId: course._id,
        order: mData.order,
        prerequisiteModuleId: prevModuleId,
        isLockedByDefault: mData.order > 1,
        mandatoryActivities: mData.mandatoryActivities,
        status: 'Published',
        estimatedHours: mData.estimatedHours,
      };

      if (!moduleDoc) {
        moduleDoc = await Module.create(moduleFields);
        console.log(`  📦 Created Module ${mData.order}: ${moduleDoc.titleAmharic}`);
      } else {
        await Module.updateOne({ _id: moduleDoc._id }, { $set: moduleFields });
        console.log(`  📦 Updated Module ${mData.order}: ${moduleDoc.titleAmharic}`);
      }

      prevModuleId = moduleDoc._id;

      // 1. Lessons
      if (mData.lessons && mData.lessons.length > 0) {
        for (const lData of mData.lessons) {
          let lessonDoc = await Lesson.findOne({ moduleId: moduleDoc._id, order: lData.order });
          const lessonFields = {
            title: lData.title,
            titleAmharic: lData.titleAmharic,
            content: lData.readingContentAmharic,
            readingContent: lData.readingContentAmharic,
            readingContentAmharic: lData.readingContentAmharic,
            readingEstimatedMinutes: lData.readingEstimatedMinutes || 15,
            isReadingMandatory: true,
            topic: lData.topic,
            objectives: lData.objectives,
            bibleReferences: lData.bibleReferences || [],
            course: course._id,
            moduleId: moduleDoc._id,
            order: lData.order,
            uploadedBy: adminUser ? adminUser._id : null,
            status: 'Published',
          };

          if (!lessonDoc) {
            lessonDoc = await Lesson.create(lessonFields);
            console.log(`    📖 Created Lesson ${lData.order}: ${lessonDoc.titleAmharic}`);
          } else {
            await Lesson.updateOne({ _id: lessonDoc._id }, { $set: lessonFields });
            console.log(`    📖 Updated Lesson ${lData.order}: ${lessonDoc.titleAmharic}`);
          }
        }
      }

      // 2. Quiz & Questions
      if (mData.quiz) {
        let quizDoc = await Quiz.findOne({ course: course._id, title: mData.quiz.title });
        const quizFields = {
          title: mData.quiz.title,
          description: `Module ${mData.order} Knowledge Evaluation`,
          course: course._id,
          quizType: mData.quiz.quizType || 'Weekly Quiz',
          duration: mData.quiz.duration || 15,
          maxScore: 100,
          passingMark: mData.quiz.passingMark || 75,
          published: true,
          createdBy: adminUser ? adminUser._id : new mongoose.Types.ObjectId(),
        };

        if (!quizDoc) {
          quizDoc = await Quiz.create(quizFields);
          console.log(`    📝 Created Quiz: ${quizDoc.title}`);
        } else {
          await Quiz.updateOne({ _id: quizDoc._id }, { $set: quizFields });
        }

        // Questions
        if (mData.quiz.questions && mData.quiz.questions.length > 0) {
          for (let qIdx = 0; qIdx < mData.quiz.questions.length; qIdx++) {
            const qData = mData.quiz.questions[qIdx];
            let qDoc = await Question.findOne({ quiz: quizDoc._id, text: qData.questionText });
            const qFields = {
              quiz: quizDoc._id,
              text: qData.questionText,
              questionType: 'multiple_choice',
              options: qData.options.map((opt, i) => ({
                text: opt,
                isCorrect: i === qData.correctOptionIndex,
              })),
              points: Math.round(100 / mData.quiz.questions.length),
              explanation: qData.explanation,
            };

            if (!qDoc) {
              await Question.create(qFields);
            } else {
              await Question.updateOne({ _id: qDoc._id }, { $set: qFields });
            }
          }
        }
      }

      // 3. Assignment
      if (mData.assignment) {
        let assignDoc = await Assignment.findOne({ course: course._id, title: mData.assignment.title });
        const assignFields = {
          title: mData.assignment.title,
          description: mData.assignment.description,
          course: course._id,
          maxScore: mData.assignment.maxScore || 100,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'Published',
        };

        if (!assignDoc) {
          await Assignment.create(assignFields);
          console.log(`    📋 Created Assignment: ${assignFields.title}`);
        } else {
          await Assignment.updateOne({ _id: assignDoc._id }, { $set: assignFields });
        }
      }
    }

    console.log('🎉 "ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ" course successfully seeded into LMS database with all 6 comprehensive modules, lessons, quizzes, and assignments!');
    return course;
  } catch (err) {
    console.error('❌ Error seeding Saint Paul Course:', err);
  }
}

module.exports = seedSaintPaulCourse;

// Allow direct execution
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church_system_db';
  mongoose.connect(MONGODB_URI)
    .then(() => seedSaintPaulCourse())
    .then(() => {
      console.log('Finished. Disconnecting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
