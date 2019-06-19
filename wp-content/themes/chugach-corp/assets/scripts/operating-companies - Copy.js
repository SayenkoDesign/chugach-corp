(function($) {
	
	'use strict';	
	
	
    var getLastSiblingInRow = function (element) {
        var candidate = element,
            elementTop = element.offsetTop;
        
        // Loop through the element’s next siblings and look for the first one which
        // is positioned further down the page.
        while (candidate.nextElementSibling !== null) {
            if (candidate.nextElementSibling.offsetTop > elementTop) {
                return candidate;
            }
            candidate = candidate.nextElementSibling;
        }
        return candidate;
    };
    
    
    var $column = $('.section-businesses .grid .column');
    
    //open and close column
    $column.find('.js-expander .open, .js-expander .thumbnail').click(function() {
    
        var $thisColumn = $(this).closest('.column');
      
        var elementTop = $thisColumn.offsetTop;

        var last = getLastSiblingInRow($thisColumn[0]);
        
        console.log($(last).index());
      
    
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