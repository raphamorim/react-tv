
// source/data/data.js


// source/views/views.js
enyo.kind({name:"myapp.MainView",kind:"moon.Panels",classes:"moon enyo-fit main-view",pattern:"activity",components:[{kind:"moon.Panel",title:"Hello World!",headerComponents:[{kind:"moon.IconButton",src:"assets/icon-like.png"}],components:[{kind:"moon.BodyText",content:"Your content here"}]}]});

// source/app.js
enyo.kind({name:"myapp.Application",kind:"enyo.Application",view:"myapp.MainView"}),enyo.ready(function(){new myapp.Application({name:"app"})});
