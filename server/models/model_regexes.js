const regexes = {};

// Comes from: http://emailregex.com/.
regexes.emailRegex = new RegExp('^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_]'
      + '[-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net'
      + '|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]'
      + '{1,5})?$', 'i');

regexes.nameRegex = /^[a-zA-Z'-\s]+$/;

regexes.phoneRegex = /\d{10, 15}/;

module.exports = regexes;
