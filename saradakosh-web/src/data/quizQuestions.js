/**
 * SQ-AG-001 Canonical Question Bank Data Module
 * Generated from .agents/task_assets/SQ-AG-001_QUESTION_BANK.csv
 * 
 * 25 accepted MCQs across 5 difficulty sets.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' }
];

export const SET_DIFFICULTIES = {
  1: { level: 1, label: 'Beginner', en: 'Beginner', bn: 'প্রারম্ভিক', hi: 'आरंभिक' },
  2: { level: 2, label: 'Easy', en: 'Easy', bn: 'সহজ', hi: 'सरल' },
  3: { level: 3, label: 'Intermediate', en: 'Intermediate', bn: 'মধ্যম', hi: 'मध्यम' },
  4: { level: 4, label: 'Difficult', en: 'Difficult', bn: 'কঠিন', hi: 'कঠিন' },
  5: { level: 5, label: 'Advanced', en: 'Advanced', bn: 'উন্নত', hi: 'उन्नत' }
};

export const QUIZ_QUESTIONS = [
  {
    "id": "Q001",
    "set": 1,
    "question": {
      "en": "Where was Sri Ramakrishna born?",
      "bn": "শ্রী রামকৃষ্ণ কোথায় জন্মগ্রহণ করেছিলেন?",
      "hi": "श्रीरामकृष्ण का जन्म कहाँ हुआ था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Kamarpukur",
          "bn": "কামারপুকুর",
          "hi": "कामारपुकुर"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Jayrambati",
          "bn": "জয়রামবাটী",
          "hi": "जयरामबाटी"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Dakshineswar",
          "bn": "দক্ষিণেশ্বর",
          "hi": "दक्षिणेश्वर"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Cossipore",
          "bn": "কাশীপুর",
          "hi": "काशीपुर"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Kamarpukur"
  },
  {
    "id": "Q002",
    "set": 1,
    "question": {
      "en": "What was Sri Ramakrishna's given name in childhood?",
      "bn": "শ্রী রামকৃষ্ণের বাল্যকালের দেওয়া নাম কী ছিল?",
      "hi": "श्रीरामकृष्ण का बचपन में दिया गया नाम क्या था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Gadadhar",
          "bn": "গদাধর",
          "hi": "गदाधर"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Rakhal",
          "bn": "রাখাল",
          "hi": "राखाल"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Narendranath",
          "bn": "নরেন্দ্রনাথ",
          "hi": "नरेन्द्रनाथ"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Ramlal",
          "bn": "রামলাল",
          "hi": "रामलाल"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Gadadhar"
  },
  {
    "id": "Q003",
    "set": 1,
    "question": {
      "en": "What was Swami Vivekananda's pre-monastic name?",
      "bn": "স্বামী বিবেকানন্দের সন্ন্যাস-পূর্ব নাম কী ছিল?",
      "hi": "स्वामी विवेकानंद का संन्यास-पूर्व नाम क्या था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Narendranath Datta",
          "bn": "নরেন্দ্রনাথ দত্ত",
          "hi": "नरेन्द्रनाथ दत्त"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Mahendranath Gupta",
          "bn": "মহেন্দ্রনাথ গুপ্ত",
          "hi": "महेन्द्रनाथ गुप्त"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Rakhal Chandra Ghosh",
          "bn": "রাখালচন্দ্র ঘোষ",
          "hi": "राखालचन्द्र घोष"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Sarat Chandra Chakravarty",
          "bn": "শরৎচন্দ্র চক্রবর্তী",
          "hi": "शरतचन्द्र चक्रवर्ती"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsv/m/life-of-swami-vivekananda-his-eastern-and-western-disciples#:~:text=Narendranath"
  },
  {
    "id": "Q004",
    "set": 1,
    "question": {
      "en": "With what words did Swami Vivekananda begin his first address at the World's Parliament of Religions?",
      "bn": "বিশ্বধর্ম মহাসভায় স্বামী বিবেকানন্দ তাঁর প্রথম ভাষণ কোন কথাগুলি দিয়ে শুরু করেছিলেন?",
      "hi": "विश्व धर्म संसद में स्वामी विवेकानंद ने अपना पहला भाषण किन शब्दों से शुरू किया?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Sisters and Brothers of America",
          "bn": "আমেরিকার ভগিনী ও ভ্রাতৃবৃন্দ",
          "hi": "अमेरिका की बहनों और भाइयों"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Ladies and Gentlemen",
          "bn": "মহিলাগণ ও মহোদয়গণ",
          "hi": "देवियो और सज्जनो"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Friends of India",
          "bn": "ভারতের বন্ধুগণ",
          "hi": "भारत के मित्रों"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Brothers and Sisters of the East",
          "bn": "প্রাচ্যের ভ্রাতা ও ভগিনীগণ",
          "hi": "पूर्व के भाइयों और बहनों"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsv/m/the-complete-works-of-swami-vivekananda/a/1-1-1-response-to-welcome#:~:text=Sisters%20and%20Brothers%20of%20America"
  },
  {
    "id": "Q005",
    "set": 1,
    "question": {
      "en": "Where was Holy Mother Sri Sarada Devi born?",
      "bn": "শ্রীশ্রীমা সারদা দেবীর জন্ম কোথায় হয়েছিল?",
      "hi": "श्रीशारदा देवी का जन्म कहाँ हुआ था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Jayrambati",
          "bn": "জয়রামবাটী",
          "hi": "जयरामबाटी"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Kamarpukur",
          "bn": "কামারপুকুর",
          "hi": "कामारपुकुर"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Dakshineswar",
          "bn": "দক্ষিণেশ্বর",
          "hi": "दक्षिणेश्वर"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Baghbazar",
          "bn": "বাগবাজার",
          "hi": "बागबाज़ार"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsd/m/holy-mother-sri-sarada-devi#:~:text=Jayrambati"
  },
  {
    "id": "Q006",
    "set": 2,
    "question": {
      "en": "Who recorded Sri Ramakrishna's conversations under the pen name 'M.'?",
      "bn": "'ম.' ছদ্মনামে শ্রী রামকৃষ্ণের কথোপকথন কে লিপিবদ্ধ করেছিলেন?",
      "hi": "'एम.' नाम से श्रीरामकृष्ण के संवादों को किसने लिपिबद्ध किया?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Mahendranath Gupta",
          "bn": "মহেন্দ্রনাথ গুপ্ত",
          "hi": "महेन्द्रनाथ गुप्त"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Girish Chandra Ghosh",
          "bn": "গিরিশচন্দ্র ঘোষ",
          "hi": "गिरीशचन्द्र घोष"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Mahendranath Datta",
          "bn": "মহেন্দ্রনাথ দত্ত",
          "hi": "महेन्द्रनाथ दत्त"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Ramchandra Datta",
          "bn": "রামচন্দ্র দত্ত",
          "hi": "रामचन्द्र दत्त"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsr/m/gospel-of-sri-ramakrishna#:~:text=Mahendranath%20Gupta"
  },
  {
    "id": "Q007",
    "set": 2,
    "question": {
      "en": "Which form of the Divine Mother was worshipped in the temple at Dakshineswar where Sri Ramakrishna served?",
      "bn": "দক্ষিণেশ্বরের যে মন্দিরে শ্রী রামকৃষ্ণ সেবা করতেন, সেখানে জগন্মাতার কোন রূপের পূজা হতো?",
      "hi": "दक्षिणेश्वर के जिस मंदिर में श्रीरामकृष्ण सेवा करते थे, वहाँ जगन्माता के किस रूप की पूजा होती थी?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Kali (Bhavatarini)",
          "bn": "কালী (ভবতারিণী)",
          "hi": "काली (भवतारिणी)"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Lakshmi",
          "bn": "লক্ষ্মী",
          "hi": "लक्ष्मी"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Saraswati",
          "bn": "সরস্বতী",
          "hi": "सरस्वती"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Annapurna",
          "bn": "অন্নপূর্ণা",
          "hi": "अन्नपूर्णा"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Bhavatarini"
  },
  {
    "id": "Q008",
    "set": 2,
    "question": {
      "en": "In which year did Swami Vivekananda deliver his first address at the World's Parliament of Religions?",
      "bn": "স্বামী বিবেকানন্দ কোন সালে বিশ্বধর্ম মহাসভায় তাঁর প্রথম ভাষণ দিয়েছিলেন?",
      "hi": "स्वामी विवेकानंद ने विश्व धर्म संसद में अपना पहला भाषण किस वर्ष दिया?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "1893",
          "bn": "১৮৯৩",
          "hi": "1893"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "1886",
          "bn": "১৮৮৬",
          "hi": "1886"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "1897",
          "bn": "১৮৯৭",
          "hi": "1897"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "1900",
          "bn": "১৯০০",
          "hi": "1900"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsv/m/the-complete-works-of-swami-vivekananda/a/1-1-1-response-to-welcome#:~:text=1893"
  },
  {
    "id": "Q009",
    "set": 2,
    "question": {
      "en": "At the southern tip of India, where did Swami Vivekananda meditate before going to the West?",
      "bn": "পাশ্চাত্যে যাওয়ার আগে ভারতের দক্ষিণ প্রান্তে স্বামী বিবেকানন্দ কোথায় ধ্যান করেছিলেন?",
      "hi": "पश्चिम जाने से पहले भारत के दक्षिणी छोर पर स्वामी विवेकानंद ने कहाँ ध्यान किया था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Kanyakumari (Cape Comorin)",
          "bn": "কন্যাকুমারী (কেপ কমোরিন)",
          "hi": "कन्याकुमारी (केप कोमोरिन)"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Varanasi",
          "bn": "বারাণসী",
          "hi": "वाराणसी"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Almora",
          "bn": "আলমোড়া",
          "hi": "अल्मोड़ा"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Puri",
          "bn": "পুরী",
          "hi": "पुरी"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsv/m/life-of-swami-vivekananda-his-eastern-and-western-disciples#:~:text=Cape%20Comorin"
  },
  {
    "id": "Q010",
    "set": 2,
    "question": {
      "en": "What was the name of Holy Mother Sri Sarada Devi's mother?",
      "bn": "শ্রীশ্রীমা সারদা দেবীর মাতার নাম কী ছিল?",
      "hi": "श्रीशारदा देवी की माता का नाम क्या था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Shyamasundari Devi",
          "bn": "শ্যামাসুন্দরী দেবী",
          "hi": "श्यामासुन्दरी देवी"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Chandramani Devi",
          "bn": "চন্দ্রমণি দেবী",
          "hi": "चन्द्रमणि देवी"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Bhuvaneshwari Devi",
          "bn": "ভুবনেশ্বরী দেবী",
          "hi": "भुवनेश्वरी देवी"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Yogin-Ma",
          "bn": "যোগীন-মা",
          "hi": "योगिन-माँ"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsd/m/holy-mother-sri-sarada-devi#:~:text=Shyamasundari"
  },
  {
    "id": "Q011",
    "set": 3,
    "question": {
      "en": "Rakhal Chandra, a young disciple of Sri Ramakrishna, later became which monk?",
      "bn": "শ্রী রামকৃষ্ণের তরুণ শিষ্য রাখালচন্দ্র পরে কোন সন্ন্যাসী হন?",
      "hi": "श्रीरामकृष्ण के युवा शिष्य राखालचन्द्र बाद में कौन-से संन्यासी बने?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Swami Brahmananda",
          "bn": "স্বামী ব্রহ্মানন্দ",
          "hi": "स्वामी ब्रह्मानंद"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Swami Saradananda",
          "bn": "স্বামী সারদানন্দ",
          "hi": "स्वामी सारदानंद"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Swami Premananda",
          "bn": "স্বামী প্রেমানন্দ",
          "hi": "स्वामी प्रेमानंद"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Swami Turiyananda",
          "bn": "স্বামী তুরীয়ানন্দ",
          "hi": "स्वामी तुरीयानंद"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsr/m/gospel-of-sri-ramakrishna#:~:text=Rakhal"
  },
  {
    "id": "Q012",
    "set": 3,
    "question": {
      "en": "Who was Totapuri in Sri Ramakrishna's spiritual life?",
      "bn": "শ্রী রামকৃষ্ণের সাধনজীবনে তোতাপুরী কে ছিলেন?",
      "hi": "श्रीरामकृष्ण के साधना-जीवन में तोतापुरी कौन थे?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "An Advaita Vedanta monk who guided him in nondual realization",
          "bn": "অদ্বৈত বেদান্তের সন্ন্যাসী, যিনি তাঁকে অদ্বৈত উপলব্ধিতে পথ দেখান",
          "hi": "अद्वैत वेदान्त के संन्यासी जिन्होंने उन्हें अद्वैत अनुभूति में मार्गदर्शन दिया"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "A Brahmo Samaj leader",
          "bn": "ব্রাহ্মসমাজের নেতা",
          "hi": "ब्रह्म समाज के नेता"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "A Vaishnava householder devotee",
          "bn": "বৈষ্ণব গৃহীভক্ত",
          "hi": "वैष्णव गृहस्थ भक्त"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "A priest of the Kali temple",
          "bn": "কালীমন্দিরের পুরোহিত",
          "hi": "काली मंदिर के पुजारी"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Totapuri"
  },
  {
    "id": "Q013",
    "set": 3,
    "question": {
      "en": "Which woman later became Sister Nivedita?",
      "bn": "কোন মহিলা পরে সিস্টার নিবেদিতা নামে পরিচিত হন?",
      "hi": "कौन-सी महिला बाद में सिस्टर निवेदिता के नाम से प्रसिद्ध हुईं?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Margaret Noble",
          "bn": "মার্গারেট নোবেল",
          "hi": "मार्गरेट नोबल"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Josephine MacLeod",
          "bn": "জোসেফিন ম্যাকলাউড",
          "hi": "जोसेफिन मैक्लॉड"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Sara Bull",
          "bn": "সারা বুল",
          "hi": "सारा बुल"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Sister Christine",
          "bn": "সিস্টার ক্রিস্টিন",
          "hi": "सिस्टर क्रिस्टीन"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsv/m/life-of-swami-vivekananda-his-eastern-and-western-disciples#:~:text=Margaret%20Noble"
  },
  {
    "id": "Q014",
    "set": 3,
    "question": {
      "en": "Whom did Holy Mother call her 'burden-bearer'?",
      "bn": "শ্রীশ্রীমা কাকে তাঁর 'ভারী' বা 'ভারবাহক' বলেছিলেন?",
      "hi": "श्रीशारदा देवी ने किसे अपना 'भार उठाने वाला' कहा था?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Swami Saradananda (Sarat Maharaj)",
          "bn": "স্বামী সারদানন্দ (শরৎ মহারাজ)",
          "hi": "स्वामी सारदानंद (शरत महाराज)"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Swami Brahmananda",
          "bn": "স্বামী ব্রহ্মানন্দ",
          "hi": "स्वामी ब्रह्मानंद"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Swami Premananda",
          "bn": "স্বামী প্রেমানন্দ",
          "hi": "स्वामी प्रेमानंद"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Swami Yogananda",
          "bn": "স্বামী যোগানন্দ",
          "hi": "स्वामी योगानंद"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsd/m/holy-mother-sri-sarada-devi#:~:text=Sarat%20is%20my%20burden-bearer"
  },
  {
    "id": "Q015",
    "set": 3,
    "question": {
      "en": "When devotees asked how to do japa while travelling by train or steamer, what did Holy Mother advise?",
      "bn": "ট্রেন বা স্টিমারে ভ্রমণের সময় কীভাবে জপ করতে হবে জিজ্ঞাসা করলে শ্রীশ্রীমা কী উপদেশ দিয়েছিলেন?",
      "hi": "रेल या स्टीमर से यात्रा करते समय जप कैसे करें—यह पूछने पर श्रीशारदा देवी ने क्या सलाह दी?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Do it mentally",
          "bn": "মনে মনে জপ করো",
          "hi": "मन ही मन जप करो"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Stop japa while travelling",
          "bn": "ভ্রমণের সময় জপ বন্ধ রাখো",
          "hi": "यात्रा में जप बंद रखो"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Chant loudly",
          "bn": "জোরে জপ করো",
          "hi": "ऊँचे स्वर में जप करो"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Count every repetition aloud",
          "bn": "প্রতিটি জপ উচ্চস্বরে গুনে করো",
          "hi": "हर जप को ऊँचे स्वर में गिनो"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsd/m/the-gospel-of-the-holy-mother#:~:text=You%20should%20do%20it%20mentally"
  },
  {
    "id": "Q016",
    "set": 4,
    "question": {
      "en": "What does Sri Ramakrishna's analogy of the maidservant teach a householder?",
      "bn": "শ্রী রামকৃষ্ণের দাসীর উপমা গৃহস্থকে কী শিক্ষা দেয়?",
      "hi": "श्रीरामकृष्ण की दासी की उपमा गृहस्थ को क्या शिक्षा देती है?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Perform worldly duties while keeping the mind on God and remaining inwardly unattached",
          "bn": "সংসারের কর্তব্য করো, কিন্তু মন ঈশ্বরে রাখো ও অন্তরে অনাসক্ত থাকো",
          "hi": "संसार के कर्तव्य करो, पर मन भगवान में रखो और भीतर से अनासक्त रहो"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Abandon the family immediately",
          "bn": "অবিলম্বে পরিবার ত্যাগ করো",
          "hi": "तुरंत परिवार छोड़ दो"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Wealth is the chief aim of life",
          "bn": "ধনই জীবনের প্রধান লক্ষ্য",
          "hi": "धन ही जीवन का मुख्य लक्ष्य है"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Avoid all work",
          "bn": "সব কাজ এড়িয়ে চলো",
          "hi": "सभी काम छोड़ दो"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsr/m/gospel-of-sri-ramakrishna#:~:text=maidservant"
  },
  {
    "id": "Q017",
    "set": 4,
    "question": {
      "en": "What is the central meaning of Sri Ramakrishna's teaching, 'As many faiths, so many paths'?",
      "bn": "শ্রী রামকৃষ্ণের 'যত মত, তত পথ' শিক্ষার মূল অর্থ কী?",
      "hi": "श्रीरामकृष्ण की शिक्षा 'जितने मत, उतने पथ' का मुख्य अर्थ क्या है?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Different sincere religious paths can lead to the same Divine Reality",
          "bn": "বিভিন্ন আন্তরিক ধর্মপথ একই পরম সত্যের দিকে নিয়ে যেতে পারে",
          "hi": "विभिन्न ईमानदार धार्मिक मार्ग उसी परम सत्य तक पहुँचा सकते हैं"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "All rituals are exactly identical",
          "bn": "সব আচার হুবহু একই",
          "hi": "सभी अनुष्ठान बिल्कुल एक जैसे हैं"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Only one scripture is true",
          "bn": "কেবল একটি শাস্ত্রই সত্য",
          "hi": "केवल एक शास्त्र सत्य है"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Religion is unnecessary",
          "bn": "ধর্মের প্রয়োজন নেই",
          "hi": "धर्म की आवश्यकता नहीं है"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsr/m/gospel-of-sri-ramakrishna#:~:text=As%20many%20faiths%2C%20so%20many%20paths"
  },
  {
    "id": "Q018",
    "set": 4,
    "question": {
      "en": "According to Swami Vivekananda, what is religion fundamentally?",
      "bn": "স্বামী বিবেকানন্দের মতে ধর্ম মূলত কী?",
      "hi": "स्वामी विवेकानंद के अनुसार धर्म मूलतः क्या है?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Realisation",
          "bn": "উপলব্ধি",
          "hi": "अनुभूति"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Mere doctrine",
          "bn": "কেবল মতবাদ",
          "hi": "केवल सिद्धान्त"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Ritual alone",
          "bn": "কেবল আচার",
          "hi": "केवल अनुष्ठान"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Intellectual argument",
          "bn": "বুদ্ধিবৃত্তিক তর্ক",
          "hi": "बौद्धिक तर्क"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsv/m/the-complete-works-of-swami-vivekananda/a/6-2-2-religion-is-realisation#:~:text=Religion%20is%20realisation"
  },
  {
    "id": "Q019",
    "set": 4,
    "question": {
      "en": "What is the central ideal of Karma-Yoga as taught by Swami Vivekananda?",
      "bn": "স্বামী বিবেকানন্দের শিক্ষায় কর্মযোগের কেন্দ্রীয় আদর্শ কী?",
      "hi": "स्वामी विवेकानंद की शिक्षा में कर्मयोग का केंद्रीय आदर्श क्या है?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Work unselfishly, without attachment to its fruits",
          "bn": "ফলের প্রতি আসক্তি ছাড়া নিঃস্বার্থভাবে কাজ করা",
          "hi": "फल की आसक्ति के बिना निःस्वार्थ भाव से कर्म करना"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Avoid all action",
          "bn": "সব কর্ম এড়িয়ে চলা",
          "hi": "सभी कर्मों से बचना"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Work only for reward",
          "bn": "কেবল পুরস্কারের জন্য কাজ করা",
          "hi": "केवल पुरस्कार के लिए काम करना"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Perform ritual alone",
          "bn": "কেবল আচার করা",
          "hi": "केवल अनुष्ठान करना"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsv/m/the-complete-works-of-swami-vivekananda/a/1-2-8-the-ideal-of-karma-yoga#:~:text=without%20attachment"
  },
  {
    "id": "Q020",
    "set": 4,
    "question": {
      "en": "According to Holy Mother's famous counsel, what should one do to attain peace?",
      "bn": "শ্রীশ্রীমার বিখ্যাত উপদেশ অনুযায়ী শান্তি পেতে কী করা উচিত?",
      "hi": "श्रीशारदा देवी के प्रसिद्ध उपदेश के अनुसार शांति पाने के लिए क्या करना चाहिए?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "See one's own faults instead of finding faults in others, and make the whole world one's own",
          "bn": "অন্যের দোষ না দেখে নিজের দোষ দেখো এবং সমগ্র জগৎকে আপন করে নাও",
          "hi": "दूसरों के दोष न देखकर अपने दोष देखो और पूरे संसार को अपना बनाओ"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Withdraw completely from everyone",
          "bn": "সকলের থেকে সম্পূর্ণ বিচ্ছিন্ন হও",
          "hi": "सभी से पूरी तरह अलग हो जाओ"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Win every argument",
          "bn": "সব তর্কে জয়ী হও",
          "hi": "हर बहस जीतने की कोशिश करो"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Seek material security first",
          "bn": "আগে বস্তুগত নিরাপত্তা খোঁজো",
          "hi": "पहले भौतिक सुरक्षा खोजो"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsd/m/the-gospel-of-the-holy-mother#:~:text=if%20you%20want%20peace"
  },
  {
    "id": "Q021",
    "set": 5,
    "question": {
      "en": "According to Sri Ramakrishna, what is the relationship between Brahman and Shakti?",
      "bn": "শ্রী রামকৃষ্ণের মতে ব্রহ্ম ও শক্তির সম্পর্ক কী?",
      "hi": "श्रीरामकृष्ण के अनुसार ब्रह्म और शक्ति का संबंध क्या है?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "They are inseparable—like fire and its power to burn",
          "bn": "তারা অবিচ্ছেদ্য—যেমন আগুন ও তার দাহিকাশক্তি",
          "hi": "वे अभिन्न हैं—जैसे अग्नि और उसकी दाहक शक्ति"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "They are opposing realities",
          "bn": "তারা পরস্পরবিরোধী সত্য",
          "hi": "वे परस्पर विरोधी सत्य हैं"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Shakti is wholly unreal",
          "bn": "শক্তি সম্পূর্ণ অবাস্তব",
          "hi": "शक्ति पूरी तरह असत्य है"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "They have no relation",
          "bn": "তাদের কোনো সম্পর্ক নেই",
          "hi": "उनका कोई संबंध नहीं है"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsr/m/gospel-of-sri-ramakrishna#:~:text=Brahman%20and%20Sakti%20are%20identical"
  },
  {
    "id": "Q022",
    "set": 5,
    "question": {
      "en": "After Sri Ramakrishna's nondual realization, in what state did the Divine Mother command him to remain?",
      "bn": "অদ্বৈত উপলব্ধির পর জগন্মাতা শ্রী রামকৃষ্ণকে কোন অবস্থায় থাকতে নির্দেশ দিয়েছিলেন?",
      "hi": "अद्वैत अनुभूति के बाद जगन्माता ने श्रीरामकृष्ण को किस अवस्था में रहने की आज्ञा दी?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Bhavamukha",
          "bn": "ভাবমুখ",
          "hi": "भावमुख"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Nirvikalpa Samadhi permanently",
          "bn": "চিরস্থায়ী নির্বিকল্প সমাধি",
          "hi": "स्थायी निर्विकल्प समाधि"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Ordinary household life",
          "bn": "সাধারণ গৃহস্থ জীবন",
          "hi": "सामान्य गृहस्थ जीवन"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Temple ritual alone",
          "bn": "কেবল মন্দিরের আচার",
          "hi": "केवल मंदिर-पूजा"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsr/m/sri-ramakrishna-the-great-master#:~:text=Remain%20in%20Bhavamukha"
  },
  {
    "id": "Q023",
    "set": 5,
    "question": {
      "en": "In Swami Vivekananda's Rameswaram address on real worship, who is described as truly worshipping Shiva?",
      "bn": "বাস্তব উপাসনা নিয়ে রামেশ্বরমের ভাষণে স্বামী বিবেকানন্দ কাকে প্রকৃত শিব-উপাসক বলেছেন?",
      "hi": "वास्तविक उपासना पर रामेश्वरम् के भाषण में स्वामी विवेकानंद ने किसे सच्चा शिव-उपासक कहा?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "One who sees and serves Shiva in the poor, the weak, and the diseased",
          "bn": "যে দরিদ্র, দুর্বল ও রোগীর মধ্যে শিবকে দেখে ও সেবা করে",
          "hi": "जो गरीब, दुर्बल और रोगी में शिव को देखता और सेवा करता है"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "One who only offers flowers to an image",
          "bn": "যে কেবল মূর্তিতে ফুল দেয়",
          "hi": "जो केवल मूर्ति पर फूल चढ़ाता है"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "One who only goes on pilgrimage",
          "bn": "যে কেবল তীর্থ করে",
          "hi": "जो केवल तीर्थयात्रा करता है"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "One who only studies scriptures",
          "bn": "যে কেবল শাস্ত্র অধ্যয়ন করে",
          "hi": "जो केवल शास्त्र पढ़ता है"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/tsv/m/the-complete-works-of-swami-vivekananda/a/3-4-4-address-at-the-r%C4%81meshwaram-temple-on-real-worship#:~:text=He%20who%20sees%20Shiva%20in%20the%20poor"
  },
  {
    "id": "Q024",
    "set": 5,
    "question": {
      "en": "When Sri Ramakrishna sent Narendra to Mother Kali to pray for his family's material needs, what did Narendra ask for instead?",
      "bn": "শ্রী রামকৃষ্ণ নরেন্দ্রকে পরিবারের অভাব দূর করার জন্য মা কালীর কাছে প্রার্থনা করতে পাঠালে, নরেন্দ্র তার বদলে কী চেয়েছিলেন?",
      "hi": "जब श्रीरामकृष्ण ने नरेन्द्र को परिवार की आर्थिक आवश्यकता के लिए माँ काली से प्रार्थना करने भेजा, तो नरेन्द्र ने उसके बदले क्या माँगा?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "Discrimination, renunciation, knowledge, and devotion",
          "bn": "বিবেক, বৈরাগ্য, জ্ঞান ও ভক্তি",
          "hi": "विवेक, वैराग्य, ज्ञान और भक्ति"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Wealth and employment",
          "bn": "ধন ও চাকরি",
          "hi": "धन और नौकरी"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Political power",
          "bn": "রাজনৈতিক ক্ষমতা",
          "hi": "राजनीतिक शक्ति"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "Fame and influence",
          "bn": "খ্যাতি ও প্রভাব",
          "hi": "यश और प्रभाव"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsv/m/life-of-swami-vivekananda-his-eastern-and-western-disciples#:~:text=Mother%2C%20give%20me%20discrimination"
  },
  {
    "id": "Q025",
    "set": 5,
    "question": {
      "en": "How did Holy Mother say she looked upon her disciples?",
      "bn": "শ্রীশ্রীমা বলেছিলেন, তিনি তাঁর শিষ্যদের কীভাবে দেখেন?",
      "hi": "श्रीशारदा देवी ने कहा कि वे अपने शिष्यों को किस रूप में देखती हैं?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "en": "As Narayana and as her sons as well",
          "bn": "নারায়ণরূপে এবং নিজের সন্তানরূপেও",
          "hi": "नारायण के रूप में और अपने पुत्रों के रूप में भी"
        }
      },
      {
        "id": "B",
        "text": {
          "en": "Only as students",
          "bn": "কেবল ছাত্ররূপে",
          "hi": "केवल विद्यार्थियों के रूप में"
        }
      },
      {
        "id": "C",
        "text": {
          "en": "Only as servants",
          "bn": "কেবল সেবকরূপে",
          "hi": "केवल सेवकों के रूप में"
        }
      },
      {
        "id": "D",
        "text": {
          "en": "As strangers seeking instruction",
          "bn": "উপদেশপ্রার্থী অপরিচিত মানুষরূপে",
          "hi": "उपदेश चाहने वाले अपरिचित लोगों के रूप में"
        }
      }
    ],
    "correctOptionId": "A",
    "verificationUrl": "https://englishbooks.rkmm.org/s/lsd/m/holy-mother-sri-sarada-devi#:~:text=I%20look%20upon%20you%20as%20Narayana%2C%20and%20as%20sons%20also"
  }
];

/**
 * Returns the 5 questions for the given set (1-5).
 * @param {number} setNumber 
 * @returns {Array} 5 questions
 */
export function getQuestionsBySet(setNumber) {
  return QUIZ_QUESTIONS.filter((q) => q.set === setNumber);
}

/**
 * Validates the question bank integrity per task specification:
 * - total questions = 25
 * - each set contains exactly 5 questions
 * - each question has exactly 4 options
 * - each question has all three language texts
 * - each question has a valid correct option ID
 * - each question has an RKMM URL
 */
export function validateQuestionBank() {
  if (QUIZ_QUESTIONS.length !== 25) {
    throw new Error('Expected 25 questions, got ' + QUIZ_QUESTIONS.length);
  }
  for (let s = 1; s <= 5; s++) {
    const setQuestions = getQuestionsBySet(s);
    if (setQuestions.length !== 5) {
      throw new Error('Set ' + s + ' does not have 5 questions (has ' + setQuestions.length + ')');
    }
  }
  for (const q of QUIZ_QUESTIONS) {
    if (!q.id || !q.id.startsWith('Q')) throw new Error('Invalid id: ' + q.id);
    if (!q.question.en || !q.question.bn || !q.question.hi) {
      throw new Error('Missing localized question in ' + q.id);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error('Question ' + q.id + ' must have 4 options');
    }
    for (const opt of q.options) {
      if (!['A', 'B', 'C', 'D'].includes(opt.id)) {
        throw new Error('Invalid option ID ' + opt.id + ' in ' + q.id);
      }
      if (!opt.text.en || !opt.text.bn || !opt.text.hi) {
        throw new Error('Missing option text in ' + q.id + ' opt ' + opt.id);
      }
    }
    if (!['A', 'B', 'C', 'D'].includes(q.correctOptionId)) {
      throw new Error('Invalid correctOptionId in ' + q.id + ': ' + q.correctOptionId);
    }
    if (!q.verificationUrl || !q.verificationUrl.startsWith('https://englishbooks.rkmm.org/')) {
      throw new Error('Invalid RKMM verification URL in ' + q.id + ': ' + q.verificationUrl);
    }
  }
  return true;
}
