<?php

function _s_get_tabs() {
    // List of templates to use as tabs    
    $templates = [
            'page-templates/order-books.php',
            'page-templates/edit-bio.php',
            'page-templates/change-password.php'
    ];
    
    // Probably no need to change anyhting below
    
    $tabs = ''; 
    
    foreach( $templates as $template ) {
        $post_id = _s_get_page_id_from_template_name( $template );
        
        if( ! $post_id ) {
            continue;
        }
        
        if( get_the_ID() == $post_id  ) {
            $tabs .= sprintf( '<li class="is-active"><span><h3>%s</h3></span></li>', 
                    get_the_title( $post_id )
                  );
        } else {
            $tabs .= sprintf( '<li><a href="%s"><h3>%s</h3></a></li>', 
                    get_permalink( $post_id ),
                    get_the_title( $post_id )
                  );   
        }
    }
    
    if( ! empty( $tabs ) ) {
        printf( '<ul class="tabs">%s</ul>', $tabs );
    }
}

_s_get_tabs();