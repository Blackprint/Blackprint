function animatePageTransition(views){
	if(views.lastSibling !== void 0){
		// Put the current DOM after the last sibling if exist
		if(views.showedSibling)
			$(views.showedSibling).insertAfter(views.lastSibling);

		var last = $(views.lastSibling);

		// Hide last DOM
		last.animateKey('scaleDown', 0.6, function(){
			// Don't hide it if it's current page after 0.6s delay
			if(last.hasClass('page-current') === false)
				last.addClass('disable-anim');
		});
	}

	// Find view that has `disable-anim` and remove it while animate it
	for (var i = 0; i < views.relatedDOM.length; i++) {
		if(views.relatedDOM[i].classList.contains('disable-anim'))
			$(views.relatedDOM[i]).removeClass('disable-anim').animateKey('scaleUpDown', {
				duration:0.6,
				delay:(i+1)*0.3,
				visible:false
			});
	}
}