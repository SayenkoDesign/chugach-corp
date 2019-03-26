(function (document, window, $) {

	'use strict';
    
    
    $(document).on('click', '.play-video', playVideo);
    
    function playVideo() {
        
        // Stop all background videos
        if( $('.background-video video').size() ) {
            $('.background-video video')[0].pause();
        }
                        
        var $this = $(this);
        
        var url = $this.data('src');
                
        var $modal = $('#' + $this.data('open'));
        
        /*
        $.ajax(url)
          .done(function(resp){
            $modal.find('.flex-video').html(resp).foundation('open');
        });
        */
        
        var $iframe = $('<iframe>', {
            src: url,
            id:  'video',
            frameborder: 0,
            scrolling: 'no'
            });
        
        $iframe.appendTo('.video-placeholder', $modal );        
        
        
        
    }
    
    // Make sure videos don't play in background
    $(document).on(
      'closed.zf.reveal', '#modal-video', function () {
        $(this).find('.video-placeholder').html('');
        if( $('.background-video video').size() ) {
            $('.background-video video')[0].play();
        }
        
      }
    );
        
    
}(document, window, jQuery));
