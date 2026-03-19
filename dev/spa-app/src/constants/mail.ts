const mainDomains = [
  'gmail.com',
  'docomo.ne.jp',
  'icloud.com',
  'softbank.ne.jp',
  'yahoo.co.jp',
  'au.com',
  'ezweb.ne.jp',
  'rakuten.jp',
  'rakumail.jp',
  'mineo.jp',
  'i.softbank.jp',
  'nifty.com',
  'excite.co.jp',
  'googlemail.com',
  'me.com',
  'ybb.ne.jp',
  'ymobile.ne.jp',
  'ymail.ne.jp',
  'jambo-inc.io',
];

export const isMainDomain = (email: string) => {
  const domain = extractDomain(email);
  if (!domain) return false;
  return mainDomains.includes(domain);
};

export const extractDomain = (email: string) => {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return null;
  return email.substring(atIndex + 1);
};
