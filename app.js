var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var socket = require('socket.io');


mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;



// for Routes
var routes = require('./routes/index');
var users = require('./routes/users');

//Init app
var app = express();



//view engine
app.set('views',path.join(__dirname ,'views'));
app.engine('handlebars' , exphbs({defaultLayout:'layout'}));
app.set('view engine' , 'handlebars');

//Body parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


//set Static Folder

app.use(express.static(path.join(__dirname , 'public')));

//Express Session

app.use(session({
	secret : 'secret' ,
	saveUninitialized: true,
	resave: true
}));


//Passport Initialisation

app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
	errorFormatter: function(param , msg , value) {
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam ,
			msg : msg,
			value : value
		};
	}
}));

// Socket setup & pass server
var io = socket(server);
console.log('Waiting For Sockets');
io.on('connection', (socket) => {

		console.log('made socket connection', socket.id);

		// Handle chat event
		socket.on('chat', function(data){
				// console.log(data);
				io.sockets.emit('chat', data);
		});

		// Handle typing event
		socket.on('typing', function(data){
				socket.broadcast.emit('typing', data);
		});

});



//connect flash
app.use(flash());
//global vars
app.use(function (req, res , next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null ;
	next();
});

app.use('/' , routes);
app.use('/users' , users);

app.set('port' , (process.env.PORT || 4300));


//Socket  And Port Initialisation
var server = app.listen(4300, function(){
    console.log('listening for requests on port 4300,');
		console.log('Server Started at Port ' +app.get('port'));

});
