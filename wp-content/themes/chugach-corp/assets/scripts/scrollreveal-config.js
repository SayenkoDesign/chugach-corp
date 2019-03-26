// AOS
(function (document, window, $) {

	'use strict';
    
    // https://scrollrevealjs.org/api/defaults.html
    
    ScrollReveal({ mobile: false });
    
        
    /*
        HOME
    */
    
    // Hero
    ScrollReveal().reveal('.home .section-hero h1', { 
        delay: 400,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-hero h3', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-hero button', { 
        delay: 1200,
        scale: 0.1
    });
    
    ScrollReveal().reveal('.home .section-hero .photos', { 
        delay: 1200,
        origin: 'bottom',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-hero .scroll-next', { 
        delay: 1600,
        scale: 0.1
    });  

    
    // What
    
    ScrollReveal().reveal('.section-what h2', { 
        delay: 400,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-what h3', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-what p', { 
        delay: 1200,
        origin: 'bottom',
	    distance: '100%',
    });
    
    
    // Mission
    
    ScrollReveal().reveal('.section-mission', { 
        delay: 400,
    });
    
    ScrollReveal().reveal('.section-mission h1', { 
        delay: 400,
        origin: 'left',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.section-mission h3', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission .mission-content__image', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission h2', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission .divider', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.section-mission .mission-content__navigation.show-for-large img', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission .links', { 
        delay: 800,
        origin: 'bottom',
	    distance: '100%',
    });
    
    // Odd
    
    ScrollReveal().reveal('.section-mission-1 h1', { 
        delay: 400,
        origin: 'right',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.section-mission-1 h3', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission-1 .mission-content__image', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission-1 h2', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission-1 .divider', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.section-mission-1 .mission-content__navigation.show-for-large img', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });

    
    
    // Global
    
    // Footer CTA
    
    ScrollReveal().reveal('.section-footer-cta', { 
        delay: 400,
    });
    
    ScrollReveal().reveal('.section-footer-cta h3', { 
        delay: 800,
        origin: 'bottom',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-footer-cta .unstack-medium  .column:first-child', { 
        delay: 1200,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-footer-cta .unstack-medium  .column:last-child', { 
        delay: 1200,
        origin: 'right',
	    distance: '100%',
    });
    
}(document, window, jQuery));

