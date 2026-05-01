<?php
/**
 * Plugin Name: Profile Card
 * Description: Renders an interactive holographic profile card via the [profile_card] shortcode.
 * Version:     1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'PROFILE_CARD_VERSION', '1.0.0' );
define( 'PROFILE_CARD_DIR', plugin_dir_url( __FILE__ ) );

function profile_card_enqueue_assets() {
    wp_enqueue_style(
        'profile-card',
        PROFILE_CARD_DIR . 'assets/profile-card.css',
        array(),
        PROFILE_CARD_VERSION
    );
    wp_enqueue_script(
        'profile-card',
        PROFILE_CARD_DIR . 'assets/profile-card.js',
        array(),
        PROFILE_CARD_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'profile_card_enqueue_assets' );

/**
 * [profile_card] shortcode
 *
 * Attributes:
 *   name           – Display name              (default: "Your Name")
 *   title          – Job title / role           (default: "Your Title")
 *   handle         – Username, shown with @     (default: "yourhandle")
 *   status         – Status text                (default: "Available")
 *   avatar_url     – URL to avatar image        (default: "")
 *   contact_text   – Button label               (default: "Contact Me")
 *   contact_url    – URL the button links to    (default: "#contact")
 *   inner_gradient – CSS gradient string        (default: purple-blue preset)
 *   glow_color     – Behind-card glow colour    (default: "rgba(125,190,255,0.67)")
 *   glow_size      – Behind-card glow size      (default: "50%")
 *   show_user_info – Show bottom info bar       (default: "true")
 *   enable_tilt    – Enable 3-D tilt on hover   (default: "true")
 */
function profile_card_shortcode( $atts ) {
    $atts = shortcode_atts(
        array(
            'name'           => 'Your Name',
            'title'          => 'Your Title',
            'handle'         => 'yourhandle',
            'status'         => 'Available',
            'avatar_url'     => '',
            'contact_text'   => 'Contact Me',
            'contact_url'    => '#contact',
            'inner_gradient' => 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)',
            'glow_color'     => 'rgba(125, 190, 255, 0.67)',
            'glow_size'      => '50%',
            'show_user_info' => 'true',
            'enable_tilt'    => 'true',
        ),
        $atts,
        'profile_card'
    );

    $name           = esc_html( $atts['name'] );
    $title          = esc_html( $atts['title'] );
    $handle         = esc_html( $atts['handle'] );
    $status         = esc_html( $atts['status'] );
    $avatar_url     = esc_url( $atts['avatar_url'] );
    $contact_text   = esc_html( $atts['contact_text'] );
    $contact_url    = esc_url( $atts['contact_url'] );
    $inner_gradient = esc_attr( $atts['inner_gradient'] );
    $glow_color     = esc_attr( $atts['glow_color'] );
    $glow_size      = esc_attr( $atts['glow_size'] );
    $show_user_info = filter_var( $atts['show_user_info'], FILTER_VALIDATE_BOOLEAN );
    $enable_tilt    = filter_var( $atts['enable_tilt'],    FILTER_VALIDATE_BOOLEAN );

    $tilt_attr      = $enable_tilt ? 'true' : 'false';
    $avatar_alt     = esc_attr( $name . ' avatar' );

    $inline_style = sprintf(
        'style="--pc-inner-gradient:%s;--pc-behind-glow-color:%s;--pc-behind-glow-size:%s;"',
        $inner_gradient,
        $glow_color,
        $glow_size
    );

    ob_start();
    ?>
    <div class="pc-card-wrapper" data-pc-tilt="<?php echo esc_attr( $tilt_attr ); ?>" <?php echo $inline_style; ?>>
        <div class="pc-behind"></div>
        <div class="pc-card-shell">
            <section class="pc-card">
                <div class="pc-inside">
                    <div class="pc-shine"></div>
                    <div class="pc-glare"></div>

                    <div class="pc-content pc-avatar-content">
                        <?php if ( $avatar_url ) : ?>
                            <img
                                class="avatar"
                                src="<?php echo $avatar_url; ?>"
                                alt="<?php echo $avatar_alt; ?>"
                                loading="lazy"
                            />
                        <?php endif; ?>

                        <?php if ( $show_user_info ) : ?>
                            <div class="pc-user-info">
                                <div class="pc-user-details">
                                    <?php if ( $avatar_url ) : ?>
                                        <div class="pc-mini-avatar">
                                            <img
                                                src="<?php echo $avatar_url; ?>"
                                                alt="<?php echo $avatar_alt; ?>"
                                                loading="lazy"
                                            />
                                        </div>
                                    <?php endif; ?>
                                    <div class="pc-user-text">
                                        <div class="pc-handle">@<?php echo $handle; ?></div>
                                        <div class="pc-status"><?php echo $status; ?></div>
                                    </div>
                                </div>
                                <a
                                    href="<?php echo $contact_url; ?>"
                                    class="pc-contact-btn"
                                    aria-label="<?php echo esc_attr( 'Contact ' . $name ); ?>"
                                >
                                    <?php echo $contact_text; ?>
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="pc-content">
                        <div class="pc-details">
                            <h3><?php echo $name; ?></h3>
                            <p><?php echo $title; ?></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'profile_card', 'profile_card_shortcode' );
