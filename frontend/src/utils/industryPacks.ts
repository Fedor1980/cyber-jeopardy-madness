import { IndustryType, IndustryPack } from '../types';

export const industryPacks: IndustryPack[] = [
  {
    id: 'federal-credit-union',
    name: 'Federal Credit Union Security',
    description:
      'Cybersecurity training focused on NCUA regulations, FFIEC guidelines, and credit union-specific threats',
    industry_type: IndustryType.FEDERAL_CREDIT_UNION,
    compliance_frameworks: ['NCUA', 'FFIEC', 'GLBA', 'BSA/AML'],
    icon: '🏦',
    is_active: true,
  },
  {
    id: 'finance',
    name: 'Financial Services Security',
    description:
      'Banking and financial industry cybersecurity including PCI-DSS, SOX, and GLBA compliance',
    industry_type: IndustryType.FINANCE,
    compliance_frameworks: ['PCI-DSS', 'SOX', 'GLBA', 'FINRA'],
    icon: '💰',
    is_active: true,
  },
  {
    id: 'healthcare',
    name: 'Healthcare Security (HIPAA)',
    description:
      'Healthcare cybersecurity training covering HIPAA, HITECH, and patient data protection',
    industry_type: IndustryType.HEALTHCARE,
    compliance_frameworks: ['HIPAA', 'HITECH', 'FDA'],
    icon: '🏥',
    is_active: true,
  },
  {
    id: 'education',
    name: 'Education Security (FERPA)',
    description:
      'Educational institution cybersecurity including FERPA and student data protection',
    industry_type: IndustryType.EDUCATION,
    compliance_frameworks: ['FERPA', 'COPPA'],
    icon: '🎓',
    is_active: true,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & ICS/SCADA',
    description:
      'Industrial cybersecurity for manufacturing, ICS, and SCADA systems',
    industry_type: IndustryType.MANUFACTURING,
    compliance_frameworks: ['NIST', 'ICS-CERT', 'ISO 27001'],
    icon: '🏭',
    is_active: true,
  },
  {
    id: 'retail',
    name: 'Retail Security',
    description:
      'Retail cybersecurity including PCI-DSS and customer data protection',
    industry_type: IndustryType.RETAIL,
    compliance_frameworks: ['PCI-DSS', 'GDPR'],
    icon: '🛒',
    is_active: true,
  },
  {
    id: 'corporate',
    name: 'Corporate Security Awareness',
    description:
      'General corporate cybersecurity awareness and best practices',
    industry_type: IndustryType.CORPORATE,
    compliance_frameworks: ['ISO 27001', 'NIST', 'GDPR'],
    icon: '🏢',
    is_active: true,
  },
];

export const getIndustryPack = (id: string): IndustryPack | undefined => {
  return industryPacks.find((pack) => pack.id === id);
};
