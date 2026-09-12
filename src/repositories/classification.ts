import type { RequestClassification, RoutingDecision, TicketCategory, TicketPriority } from '../domain';
import { DEPARTMENT_MAP, RESPONSE_TIME_MAP } from '../domain';

export interface ClassifierContract {
  classify(text: string): RequestClassification;
  explain(classification: RequestClassification, text: string): RoutingDecision;
}

interface Rule {
  keywords: string[];
  category: TicketCategory;
  priority: TicketPriority;
  requiredInformation: string[];
  reason: string;
  reasonTA: string;
}

const RULES: Rule[] = [
  {
    keywords: ['scholarship','stipend','financial aid','grant','amount not received','payment not received','money not credited','bursary','உதவித்தொகை','தொகை','பணம்','நிதி'],
    category: 'SCHOLARSHIP_FINANCE', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request mentions a scholarship or financial payment issue, so it is being routed to the Scholarship & Finance Office.",
    reasonTA: "கோரிக்கையில் உதவித்தொகை அல்லது நிதி கொடுப்பனவு பிரச்சனை குறிப்பிடப்பட்டுள்ளது.",
  },
  {
    keywords: ['hostel','room','dormitory','dorm','boarding','accommodation','warden','fan','light','water','bathroom','toilet','maintenance','விடுதி','அறை'],
    category: 'HOSTEL', priority: 'HIGH', requiredInformation: ['studentId','roomNumber'],
    reason: "The request describes a hostel or accommodation issue, handled by Hostel Administration.",
    reasonTA: "கோரிக்கை விடுதி அல்லது தங்குமிட பிரச்சனையை விவரிக்கிறது.",
  },
  {
    keywords: ['transport','bus','route','pick up','drop','vehicle','travel','commute','போக்குவரத்து','பேருந்து'],
    category: 'TRANSPORT', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request is about transport or bus service, routed to the Transport Office.",
    reasonTA: "கோரிக்கை போக்குவரத்து அல்லது பேருந்து சேவை பற்றியது.",
  },
  {
    keywords: ['exam','examination','hall ticket','result','revaluation','mark sheet','supplementary','arrear','grade','தேர்வு','மதிப்பெண்'],
    category: 'EXAMINATION', priority: 'HIGH', requiredInformation: ['studentId','subjectCode'],
    reason: "The request involves examination, results or hall tickets, routed to the Examination Cell.",
    reasonTA: "கோரிக்கை தேர்வு, முடிவுகள் அல்லது அரங்க சீட்டுகளை உள்ளடக்கியது.",
  },
  {
    keywords: ['attendance','absent','leave','medical leave','on duty','வருகை','விடுப்பு'],
    category: 'ATTENDANCE', priority: 'NORMAL', requiredInformation: ['studentId','dateRange'],
    reason: "The request is about attendance or leave, routed to the Academic Office.",
    reasonTA: "கோரிக்கை வருகை அல்லது விடுப்பு பற்றியது.",
  },
  {
    keywords: ['library','book','journal','borrow','return','fine','overdue','நூலகம்','புத்தகம்'],
    category: 'LIBRARY', priority: 'LOW', requiredInformation: ['studentId'],
    reason: "The request is about library services, routed to the Central Library.",
    reasonTA: "கோரிக்கை நூலக சேவைகள் பற்றியது.",
  },
  {
    keywords: ['certificate','bonafide','transfer certificate','tc','transcript','character certificate','conduct certificate','migration','சான்றிதழ்'],
    category: 'CERTIFICATES', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request is for an official certificate or document, routed to the Academic Records Office.",
    reasonTA: "கோரிக்கை அதிகாரப்பூர்வ சான்றிதழ் அல்லது ஆவணத்திற்கானது.",
  },
  {
    keywords: ['internet','wifi','wi-fi','network','computer','laptop','printer','software','portal','login','password reset','இணையம்','கணினி'],
    category: 'IT_SUPPORT', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request describes an IT or technology issue, routed to the IT Help Desk.",
    reasonTA: "கோரிக்கை IT அல்லது தொழில்நுட்ப பிரச்சனையை விவரிக்கிறது.",
  },
  {
    keywords: ['placement','internship','job','company','interview','resume','campus drive','career','recruitment','வேலைவாய்ப்பு','நேர்முகம்'],
    category: 'PLACEMENT', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request is related to placement or career services, routed to the Placement & Career Cell.",
    reasonTA: "கோரிக்கை வேலைவாய்ப்பு அல்லது தொழில் சேவைகள் தொடர்பானது.",
  },
  {
    keywords: ['welfare','grievance','harassment','ragging','discrimination','counselling','mental health','நலன்','புகார்','கொடுமை'],
    category: 'WELFARE', priority: 'URGENT', requiredInformation: ['studentId'],
    reason: "The request involves student welfare or safety, routed to the Student Welfare Office with high priority.",
    reasonTA: "கோரிக்கை மாணவர் நலன் அல்லது பாதுகாப்பை உள்ளடக்கியது.",
  },
  {
    keywords: ['fees','tuition','fee','challan','receipt','due','கட்டணம்','செலுத்தல்'],
    category: 'FEES', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request is about fees or payment, routed to the Fees & Accounts Office.",
    reasonTA: "கோரிக்கை கட்டணம் அல்லது கொடுப்பனவு பற்றியது.",
  },
  {
    keywords: ['admission','application','enrol','enrollment','register','registration','சேர்க்கை','விண்ணப்பம்'],
    category: 'ADMISSION', priority: 'NORMAL', requiredInformation: ['studentId'],
    reason: "The request is about admissions or registration, routed to the Admissions Office.",
    reasonTA: "கோரிக்கை சேர்க்கை அல்லது பதிவு பற்றியது.",
  },
];

const FALLBACK: Rule = {
  keywords: [], category: 'GENERAL', priority: 'NORMAL', requiredInformation: ['studentId'],
  reason: "The request could not be matched to a specific department. It is being routed to Student Services for manual triage.",
  reasonTA: "கோரிக்கையை குறிப்பிட்ட துறை வகையுடன் பொருத்த முடியவில்லை. கையேடு வரிசைக்காக மாணவர் சேவைகளுக்கு அனுப்பப்படுகிறது.",
};

export const LocalClassifier: ClassifierContract = {
  classify(text: string): RequestClassification {
    const lower = text.toLowerCase();
    const rule = RULES.find(r => r.keywords.some(kw => lower.includes(kw.toLowerCase()))) ?? FALLBACK;
    return {
      category: rule.category,
      department: DEPARTMENT_MAP[rule.category],
      priority: rule.priority,
      requiredInformation: rule.requiredInformation,
      estimatedResponseTime: RESPONSE_TIME_MAP[rule.priority],
      reason: rule.reason,
      reasonTA: rule.reasonTA,
      confidence: 0.85,
    };
  },
  explain(classification: RequestClassification, text: string): RoutingDecision {
    const first = text.split(/[.!?]/)[0].trim();
    const detectedIssue = first.length > 80 ? first.slice(0, 77) + '…' : first;
    return {
      classification,
      detectedIssue,
      routingExplanation: classification.reason,
      routingExplanationTA: classification.reasonTA,
    };
  },
};
