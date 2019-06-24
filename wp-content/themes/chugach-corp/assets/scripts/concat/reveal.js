// Reveal
(function (document, window, $) {

	'use strict';
    
    $(document).on('click', '.page-template-regions button[data-region]', loadRegion);
    
    function loadRegion() {
        var $this = $(this);
        var $region = $('#' + $this.data('region') );
        var $modal = $('#' + $this.data('open'));
        
        if( $region.size() ) {
          $('.container', $modal ).html($region.html()); 
        }
    }

    
    $(document).on('closed.zf.reveal', '#regions', function () {
        $(this).find('.container').empty();
        // remove action button class
        $('#map-box button').removeClass( "hover" );
    });
    
    
    $(document).on('click', '.template-business-lines button[data-content]', loadMap);
    
    function loadMap() {
        var $this = $(this);
        var $map = $('#' + $this.data('content') );
        var $modal = $('#' + $this.data('open'));
        
        if( $map.size() ) {
          $('.container', $modal ).html($map.html()); 
        }
    }

    
    $(document).on('closed.zf.reveal', '#maps', function () {
        $(this).find('.container').empty();
        $('.map').stop().removeClass('active').css({'opacity':'0'});
        $('#map-0').stop().css({'opacity':'1'});
    });
    
    
    $(document).on('click', '.template-portfolio-land-resources button[data-project]', loadProject);
    
    function loadProject() {
        var $this = $(this);
        var $project = $('#' + $this.data('project') );
        var $modal = $('#' + $this.data('open'));
        
        if( $project.size() ) {
          $('.container', $modal ).html($project.html()); 
        }
    }

    
    $(document).on('closed.zf.reveal', '#projects', function () {
        $(this).find('.container').empty();
    });
        
    
}(document, window, jQuery));



