const getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    const [ key, value ] = [pair.shift(), decodeURIComponent(pair.join('='))];
    params[key] = value;
  }
  return params;
};

export default getParams;
