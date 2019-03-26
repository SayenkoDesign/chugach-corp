(function($) {
	
	'use strict';	
	
	
    var $column = $('.section-leadership .grid .column');
    
    //open and close column
    $column.find('.js-expander .open, .js-expander .thumbnail').click(function() {
    
      var $thisColumn = $(this).closest('.column');
    
      if ($thisColumn.hasClass('is-collapsed')) {
        // siblings remove open class and add closed classes
        $column.not($thisColumn).removeClass('is-expanded').addClass('is-collapsed is-inactive');
        // remove closed classes, add pen class
        $thisColumn.removeClass('is-collapsed is-inactive').addClass('is-expanded');
        
        if ($column.not($thisColumn).hasClass('is-inactive')) {
          //do nothing
        } else {
          $column.not($thisColumn).addClass('is-inactive');
        }
        
        
        var offset = 0;
        if( Foundation.MediaQuery.atLeast('xlarge') ) {
          var offset = -100;
        }
        
        $.smoothScroll({
            scrollTarget: $thisColumn,
            //offset: offset,
            beforeScroll: function() {
                $('.site-header').addClass('nav-up');
            }
        });
    
      } else {
        $thisColumn.removeClass('is-expanded').addClass('is-collapsed');
        $column.not($thisColumn).removeClass('is-inactive');
      }
    });
    
    //close card when click on cross
    $column.find('.js-collapser').click(function() {
    
      var $thisColumn = $(this).parents('.column__expander').closest('.column');
    
      $thisColumn.removeClass('is-expanded').addClass('is-collapsed is-inactive');
      $column.not($thisColumn).removeClass('is-inactive');
    
    });

})(jQuery);