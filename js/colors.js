// MBTI Colors - 16personalities official palette (vivid)
const MBTI_COLORS = {
  // Analysts NT - Purple
  INTJ: '#7B2D8E', INTP: '#9B59B6', ENTJ: '#6C1D80', ENTP: '#A86CC1',
  // Diplomats NF - Green
  INFJ: '#2EBE6E', INFP: '#43D47F', ENFJ: '#1FA85C', ENFP: '#57E894',
  // Sentinels SJ - Teal
  ISTJ: '#2E9ABF', ISFJ: '#45B8D6', ESTJ: '#1E86AA', ESFJ: '#5DC9E5',
  // Explorers SP - Gold
  ISTP: '#E4B429', ISFP: '#F0C93C', ESTP: '#D4A017', ESFP: '#F5D84A'
};

const MBTI_CHARACTERS = {
  INTJ: 'intj-architect-s3-male.svg',
  INTP: 'intp-logician-s3-female.svg',
  ENTJ: 'entj-commander-s3-female.svg',
  ENTP: 'entp-debater-s3-male.svg',
  INFJ: 'infj-advocate-s3-male.svg',
  INFP: 'infp-mediator-s3-female.svg',
  ENFJ: 'enfj-protagonist-s3-male.svg',
  ENFP: 'enfp-campaigner-s3-female.svg',
  ISTJ: 'istj-logistician-s3-male.svg',
  ISFJ: 'isfj-defender-s3-female.svg',
  ESTJ: 'estj-executive-s3-female.svg',
  ESFJ: 'esfj-consul-s3-male.svg',
  ISTP: 'istp-virtuoso-s3-male.svg',
  ISFP: 'isfp-adventurer-s3-female.svg',
  ESTP: 'estp-entrepreneur-s3-male.svg',
  ESFP: 'esfp-entertainer-s3-female.svg'
};

const MBTI_NAMES = {
  INTJ: 'Architect', INTP: 'Logician', ENTJ: 'Commander', ENTP: 'Debater',
  INFJ: 'Advocate', INFP: 'Mediator', ENFJ: 'Protagonist', ENFP: 'Campaigner',
  ISTJ: 'Logistician', ISFJ: 'Defender', ESTJ: 'Executive', ESFJ: 'Consul',
  ISTP: 'Virtuoso', ISFP: 'Adventurer', ESTP: 'Entrepreneur', ESFP: 'Entertainer'
};

const TEMPERAMENT_GROUPS = [
  { name: 'Analysts NT', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { name: 'Diplomats NF', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { name: 'Sentinels SJ', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { name: 'Explorers SP', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] }
];

// ISO 3166-1 alpha-3 → alpha-2 for flag URLs
const ISO3_TO_ISO2 = {
  AFG:'af',ALB:'al',DZA:'dz',AND:'ad',AGO:'ao',ATG:'ag',ARG:'ar',ARM:'am',AUS:'au',AUT:'at',
  AZE:'az',BHS:'bs',BHR:'bh',BGD:'bd',BRB:'bb',BLR:'by',BEL:'be',BLZ:'bz',BEN:'bj',BTN:'bt',
  BOL:'bo',BIH:'ba',BWA:'bw',BRA:'br',BRN:'bn',BGR:'bg',BFA:'bf',BDI:'bi',KHM:'kh',CMR:'cm',
  CAN:'ca',CPV:'cv',CAF:'cf',TCD:'td',CHL:'cl',CHN:'cn',COL:'co',COM:'km',COG:'cg',COD:'cd',
  CRI:'cr',CIV:'ci',HRV:'hr',CUB:'cu',CYP:'cy',CZE:'cz',DNK:'dk',DJI:'dj',DMA:'dm',DOM:'do',
  ECU:'ec',EGY:'eg',SLV:'sv',GNQ:'gq',ERI:'er',EST:'ee',SWZ:'sz',ETH:'et',FJI:'fj',FIN:'fi',
  FRA:'fr',GAB:'ga',GMB:'gm',GEO:'ge',DEU:'de',GHA:'gh',GRC:'gr',GRD:'gd',GTM:'gt',GIN:'gn',
  GNB:'gw',GUY:'gy',HTI:'ht',HND:'hn',HUN:'hu',ISL:'is',IND:'in',IDN:'id',IRN:'ir',IRQ:'iq',
  IRL:'ie',ISR:'il',ITA:'it',JAM:'jm',JPN:'jp',JOR:'jo',KAZ:'kz',KEN:'ke',KIR:'ki',PRK:'kp',
  KOR:'kr',KWT:'kw',KGZ:'kg',LAO:'la',LVA:'lv',LBN:'lb',LSO:'ls',LBR:'lr',LBY:'ly',LIE:'li',
  LTU:'lt',LUX:'lu',MDG:'mg',MWI:'mw',MYS:'my',MDV:'mv',MLI:'ml',MLT:'mt',MHL:'mh',MRT:'mr',
  MUS:'mu',MEX:'mx',FSM:'fm',MDA:'md',MCO:'mc',MNG:'mn',MNE:'me',MAR:'ma',MOZ:'mz',MMR:'mm',
  NAM:'na',NRU:'nr',NPL:'np',NLD:'nl',NZL:'nz',NIC:'ni',NER:'ne',NGA:'ng',MKD:'mk',NOR:'no',
  OMN:'om',PAK:'pk',PLW:'pw',PAN:'pa',PNG:'pg',PRY:'py',PER:'pe',PHL:'ph',POL:'pl',PRT:'pt',
  QAT:'qa',ROU:'ro',RUS:'ru',RWA:'rw',KNA:'kn',LCA:'lc',VCT:'vc',WSM:'ws',SMR:'sm',STP:'st',
  SAU:'sa',SEN:'sn',SRB:'rs',SYC:'sc',SLE:'sl',SGP:'sg',SVK:'sk',SVN:'si',SLB:'sb',SOM:'so',
  ZAF:'za',SSD:'ss',ESP:'es',LKA:'lk',SDN:'sd',SUR:'sr',SWE:'se',CHE:'ch',SYR:'sy',TWN:'tw',
  TJK:'tj',TZA:'tz',THA:'th',TLS:'tl',TGO:'tg',TON:'to',TTO:'tt',TUN:'tn',TUR:'tr',TKM:'tm',
  TUV:'tv',UGA:'ug',UKR:'ua',ARE:'ae',GBR:'gb',USA:'us',URY:'uy',UZB:'uz',VUT:'vu',VEN:'ve',
  VNM:'vn',YEM:'ye',ZMB:'zm',ZWE:'zw',PSE:'ps',XKX:'xk',NCL:'nc',SOL:'sb',SPM:'pm',
};

function getMBTIColor(type) {
  return MBTI_COLORS[type] || '#cccccc';
}

function getMBTICharacterSrc(type) {
  const file = MBTI_CHARACTERS[type];
  return file ? `assets/characters/${file}` : '';
}

function getFlagUrl(iso3) {
  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) return '';
  return `https://flagcdn.com/24x18/${iso2}.png`;
}

function getFlagUrl2x(iso3) {
  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) return '';
  return `https://flagcdn.com/48x36/${iso2}.png`;
}
