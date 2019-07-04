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
    
    ScrollReveal().reveal('.home .section-mission', { 
        delay: 400,
    });
    
    ScrollReveal().reveal('.home .section-mission h1', { 
        delay: 400,
        origin: 'left',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.home .section-mission h3', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission .mission-content__image', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission h2', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.section-mission .divider', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.home .section-mission .mission-content__navigation.show-for-large img', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission .links', { 
        delay: 800,
        origin: 'bottom',
	    distance: '100%',
    });
    
    // Odd
    
    ScrollReveal().reveal('.home .section-mission-1 h1', { 
        delay: 400,
        origin: 'right',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.home .section-mission-1 h3', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission-1 .mission-content__image', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission-1 h2', { 
        delay: 800,
        origin: 'left',
	    distance: '100%',
    });
    
    ScrollReveal().reveal('.home .section-mission-1 .divider', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
        
    ScrollReveal().reveal('.home .section-mission-1 .mission-content__navigation.show-for-large img', { 
        delay: 800,
        origin: 'right',
	    distance: '100%',
    });
    
    
    /*
        HISTORY
    */
    ScrollReveal().reveal('.section-timeline .decade', { 
        delay: 500,
        scale: 0.1,
        viewFactor: 1
    });  
    
    $('.section-timeline .row').children('article').each(function (index, element) {
        //var id = $(element).attr('id'); 
        console.log('#' + element.id);
        ScrollReveal().reveal( '#' + element.id, { 
            delay: 1000,
            origin: index % 2 ? 'right' : 'left',
            distance: '100%',
            interval: 1000,
            viewFactor: 0.5
        });
    });

    
    
    /*
        GLOBAL
    */ 
    
    // Mission
    ScrollReveal().reveal('body:not(.home) .section-hero .hero-content', { 
        delay: 500,
        origin: 'bottom',
	    distance: '50%',
    });  
     
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
    
    
    /*
        MULTI PURPOSE
    */
    
    ScrollReveal().reveal('.section-block .column', { 
        delay: 500,
        interval: 1000,
        viewFactor: 0.5
    });
    
    ScrollReveal().reveal('.section-block img', { 
        delay: 500,
        origin: 'bottom',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });
    
    
    /*
        WHO WE ARE
    */
    
    // Mission
    ScrollReveal().reveal('.page-template-who-we-are .site-main .section', { 
        delay: 1000,
        interval: 500
    });
    
    // Mission
    ScrollReveal().reveal('.section-mission header', { 
        delay: 1000,
        origin: 'left',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });
    
    ScrollReveal().reveal('.section-mission h3', { 
        delay: 1000,
        origin: 'right',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });

    // Vision    
    ScrollReveal().reveal('.section-vision .column', { 
        delay: 1500,
        interval: 1000,
        viewFactor: 0.5
    });
    
    ScrollReveal().reveal('.section-vision img', { 
        delay: 1500,
        origin: 'bottom',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });
    
    
    // Core Behaviors
    ScrollReveal().reveal('.section-core-behaviors header', { 
        delay: 1000,
        origin: 'left',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });
    
    ScrollReveal().reveal('.section-core-behaviors h3', { 
        delay: 1000,
        origin: 'right',
	    distance: '50%',
        interval: 1000,
        viewFactor: 0.5
    });
    
    ScrollReveal().reveal('.section-core-behaviors .grid .column', { 
        delay: 1000,
        origin: 'bottom',
	    distance: '50%',
        interval: 250,
        viewFactor: 0.5
    });
    
    
}(document, window, jQuery));

