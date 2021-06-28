var parser = exports;

function nyam(){
console.clear();

var code = `
Register('name/spaced/node', function(handle, node){
	node.title = "Abc";

	var output = handle.output = {
	    Result: i8
	};

	var input = handle.input = {
	    A: i8,
	    B: i8,
	};

	handle.init = function(){
		node.on('cable.connect', function(cable){
			console.log(\`Cable connected from \${cable.owner.node.title} (\${cable.owner.name})\`);
		});
	}

	function multiply(){
	    console.log('Multiplying', output.A, 'with', input.B);
	    return input.A * input.B;
	}

	handle.update = function(Cable){
	    output.Result = multiply();
	}
});`;

  function cleaner(obj){
    for(var key in obj){
      var temp = obj[key];
      if(!temp)
        continue;

      if(temp.loc){
        delete temp.loc;
        delete temp.start;
        delete temp.end;
        cleaner(temp);
      }
    }
  }

  var ast = parser.parse(code).program.body;

  // Find namespace and get handle/node var name
  var namespace = '', body;
  for(var i=0; i<ast.length; i++){
    var current = ast[i].expression;
    if(current.type !== 'CallExpression' || current.callee.name !== 'Register')
      continue;

    namespace = current.arguments[0].value;
    body = current.arguments[1];
    break;
  }

  var mainArgs = [body.params[0].name];
  if(body.params.length !== 1)
    mainArgs.push(body.params[1].name);

  // Get first function body
  body = body.body.body;
  cleaner(body);

  // Can still have relation with Handle initialization
  console.log(body);

  mainArgs = mainArgs.join(', ');
  console.log(`
Blackprint.registerNode('${namespace}', function(${mainArgs}){${body}});`);
}