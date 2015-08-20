import 'source-map-support/register';
// Comes from: http://emailregex.com/.
export const emailRegex = new RegExp('^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a'
      + '-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|n'
      + 'ame|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))'
      + '(:[0-9]{1,5})?$', 'i');

export const nameRegex = /^[a-zA-Z'-\s]+$/;

export const phoneRegex = /[0-9]+/;
