<?php
$tab_args = array( 'class' => 'tabs', 
   'id' => 'revision-tabs', 
   'data' => array( 'data-tabs' => 'revision-tabs' )
 );

$fa_tabs = new Foundation_Tabs( $tab_args );
                    
$active = false;                  

if( ! empty( $bio ) ) {
    $args = array( 'title' => 'Bio', 'content' => $bio, 'active' => $active );
    $fa_tabs->add_tab( $args );
}

if( ! empty( $dream_kit ) ) {
    $books = $dream_kit['books'];
    $books_subtotal = $dream_kit['books_subtotal'];
    $taxes = $dream_kit['taxes'];
    $operations = $dream_kit['operations'];
    $total_cost = $dream_kit['total_cost'];
    
    $table = '';
    
    if( ! empty( $books ) ) {
        $table .= sprintf( '<div class="row"><div class="column">Books x%d</div><div class="column"><span>%s</span></div></div>', 
                          count( $books ), money_format( '$%.2n', $books_subtotal ) );
    }
    
    if( ! empty( $taxes ) ) {
        $table .= sprintf( '<div class="row"><div class="column">Taxes</div><div class="column"><span>%s</span></div></div>', 
                          money_format( '$%.2n', $taxes ) );
    }
    
    if( ! empty( $operations ) ) {
        $table .= sprintf( '<div class="row"><div class="column">Dream Reachers Operations (%s)</div><div class="column"><span>%s</span></div></div>', 
                          '15%', money_format( '$%.2n', $operations ) );
    }
    
    if( ! empty( $total_cost ) ) {
        $table .= sprintf( '<div class="row"><div class="column"><strong>Total Cost</strong></div><div class="column"><span>%s</span></div></div>', 
                          money_format( '$%.2n', $total_cost ) );
    }
        
    if( ! empty( $table ) ) {
        $active = $active ? false : true; 
        $table = sprintf( '<div class="table">%s</div>', $table );
        $args = array( 'title' => 'Dream Kit Cost', 'content' => $table, 'active' => $active );
        $fa_tabs->add_tab( $args );
    }
    
    printf( '<div class="tabs-container">%s</div>',  $fa_tabs->get_tabs() );
}
