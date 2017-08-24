/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

enyo.kind({
	name: "myapp.MainView",
	kind: "moon.Panels",
	classes: "moon enyo-fit main-view",
	pattern:"activity",
	components: [
		{kind: "moon.Panel", title: "Hello World!", headerComponents: [
			{kind: "moon.IconButton", src: "assets/icon-like.png"}
		], components: [
			{kind: "moon.BodyText", content: "Your content here"}
		]}
	]
});
