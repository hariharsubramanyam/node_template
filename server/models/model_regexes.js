// Some useful regexes for validating strings in the models.

import 'source-map-support/register';

// Comes from: http://emailregex.com/.
export const emailRegex = new RegExp('^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a'
      + '-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|n'
      + 'ame|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))'
      + '(:[0-9]{1,5})?$', 'i');

// Names must consist of letters, spaces, ', and -.
export const nameRegex = /^[a-zA-Z'-\s]+$/;

// Phone numbers must be a sequence of digits.
export const phoneRegex = /[0-9]+/;
