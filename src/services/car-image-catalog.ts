/**
 * Online car image catalog — maps official AC car IDs to public image URLs.
 * Covers all official cars (base game + all DLCs).
 * Images sourced from Wikimedia Commons (CC-licensed).
 *
 * URL pattern uses Wikimedia Commons thumbnails at 640px width.
 */

const CAR_IMAGE_CATALOG: Record<string, string> = {
  // ─── Abarth ─────────────────────────────────────────────────────────
  'abarth500':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Fiat_Abarth_500_%282%29.JPG/640px-Fiat_Abarth_500_%282%29.JPG',
  'abarth500_assetto_corse':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Fiat_Abarth_500_%282%29.JPG/640px-Fiat_Abarth_500_%282%29.JPG',
  'ks_abarth_595ss':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/2015_Abarth_595.jpg/640px-2015_Abarth_595.jpg',
  'ks_abarth_595ss_s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/2015_Abarth_595.jpg/640px-2015_Abarth_595.jpg',

  // ─── Alfa Romeo ─────────────────────────────────────────────────────
  'alfa_romeo_155_v6':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Alfa_Romeo_155_front_20080825.jpg/640px-Alfa_Romeo_155_front_20080825.jpg',
  'ks_alfa_romeo_4c':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/2015_Alfa_Romeo_4C_%28960%29_coupe_%2825490717390%29.jpg/640px-2015_Alfa_Romeo_4C_%28960%29_coupe_%2825490717390%29.jpg',
  'ks_alfa_romeo_gta':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Alfa_Romeo_Giulia_GTA_%281965%29_1X7A8066.jpg/640px-Alfa_Romeo_Giulia_GTA_%281965%29_1X7A8066.jpg',
  'ks_alfa_romeo_mito_qv':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Alfa_Romeo_MiTo_Quadrifoglio_Verde_%E2%80%93_Frontansicht%2C_1._Mai_2012%2C_D%C3%BCsseldorf.jpg/640px-Alfa_Romeo_MiTo_Quadrifoglio_Verde_%E2%80%93_Frontansicht%2C_1._Mai_2012%2C_D%C3%BCsseldorf.jpg',

  // ─── Audi ───────────────────────────────────────────────────────────
  'ks_audi_a1s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Audi_S1_%E2%80%93_Frontansicht%2C_16._M%C3%A4rz_2014%2C_D%C3%BCsseldorf.jpg/640px-Audi_S1_%E2%80%93_Frontansicht%2C_16._M%C3%A4rz_2014%2C_D%C3%BCsseldorf.jpg',
  'ks_audi_r18_etron_quattro':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Audi_R18_%28Le_Mans%2C_2011%29.jpg/640px-Audi_R18_%28Le_Mans%2C_2011%29.jpg',
  'ks_audi_r8_lms':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Audi_R8_LMS_ultra_%2812957820013%29.jpg/640px-Audi_R8_LMS_ultra_%2812957820013%29.jpg',
  'ks_audi_r8_plus':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Festival_automobile_international_2014_-_Audi_R8_V10_Plus_-_005.jpg/640px-Festival_automobile_international_2014_-_Audi_R8_V10_Plus_-_005.jpg',
  'ks_audi_sport_quattro':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Audi_Sport_Quattro_-_Rallye_Sanremo_1985_-_002.jpg/640px-Audi_Sport_Quattro_-_Rallye_Sanremo_1985_-_002.jpg',
  'ks_audi_sport_quattro_rally':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Audi_Sport_Quattro_S1_-_Flickr_-_exfordy.jpg/640px-Audi_Sport_Quattro_S1_-_Flickr_-_exfordy.jpg',
  'ks_audi_tt_cup':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Audi_TT_%288S%29_cup.jpg/640px-Audi_TT_%288S%29_cup.jpg',
  'ks_audi_tt_vln':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Audi_TT_%288S%29_cup.jpg/640px-Audi_TT_%288S%29_cup.jpg',

  // ─── BMW ────────────────────────────────────────────────────────────
  'bmw_1m':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BMW_1M_Coupe_%28E82%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg/640px-BMW_1M_Coupe_%28E82%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg',
  'bmw_1m_s3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BMW_1M_Coupe_%28E82%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg/640px-BMW_1M_Coupe_%28E82%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg',
  'bmw_m3_e30':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/BMW_M3_E30_front_20090514.jpg/640px-BMW_M3_E30_front_20090514.jpg',
  'bmw_m3_e30_drift':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/BMW_M3_E30_front_20090514.jpg/640px-BMW_M3_E30_front_20090514.jpg',
  'bmw_m3_e30_dtm':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/BMW_M3_E30_front_20090514.jpg/640px-BMW_M3_E30_front_20090514.jpg',
  'bmw_m3_e30_gra':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/BMW_M3_E30_front_20090514.jpg/640px-BMW_M3_E30_front_20090514.jpg',
  'bmw_m3_e92':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2008_BMW_M3_coupe_%28E92%29_01.jpg/640px-2008_BMW_M3_coupe_%28E92%29_01.jpg',
  'bmw_m3_e92_drift':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2008_BMW_M3_coupe_%28E92%29_01.jpg/640px-2008_BMW_M3_coupe_%28E92%29_01.jpg',
  'bmw_m3_gt2':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/BMW_M3_GT2_Art_Car_by_Jeff_Koons_%284686631683%29.jpg/640px-BMW_M3_GT2_Art_Car_by_Jeff_Koons_%284686631683%29.jpg',
  'bmw_z4':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BMW_Z4_sDrive35is_%28E89%29_%E2%80%93_Frontansicht%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg/640px-BMW_Z4_sDrive35is_%28E89%29_%E2%80%93_Frontansicht%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg',
  'bmw_z4_drift':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BMW_Z4_sDrive35is_%28E89%29_%E2%80%93_Frontansicht%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg/640px-BMW_Z4_sDrive35is_%28E89%29_%E2%80%93_Frontansicht%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg',
  'bmw_z4_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/BMW_Z4_GT3_%287490735846%29.jpg/640px-BMW_Z4_GT3_%287490735846%29.jpg',
  'ks_bmw_m235i_racing':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/BMW_M235i_Racing_%2817198972606%29.jpg/640px-BMW_M235i_Racing_%2817198972606%29.jpg',
  'ks_bmw_m4':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2015_BMW_M4_%28F82%29_coupe_%2825301183696%29.jpg/640px-2015_BMW_M4_%28F82%29_coupe_%2825301183696%29.jpg',
  'ks_bmw_m4_akrapovic':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2015_BMW_M4_%28F82%29_coupe_%2825301183696%29.jpg/640px-2015_BMW_M4_%28F82%29_coupe_%2825301183696%29.jpg',
  'ks_bmw_m3_e92_s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2008_BMW_M3_coupe_%28E92%29_01.jpg/640px-2008_BMW_M3_coupe_%28E92%29_01.jpg',

  // ─── Chevrolet ──────────────────────────────────────────────────────
  'ks_corvette_c7_stingray':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Chevrolet_Corvette_C7_Stingray.jpg/640px-Chevrolet_Corvette_C7_Stingray.jpg',
  'ks_corvette_c7r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Chevrolet_Corvette_C7.R.JPG/640px-Chevrolet_Corvette_C7.R.JPG',

  // ─── Ferrari ────────────────────────────────────────────────────────
  'ferrari_312t':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/LaudaNiki19760731Ferrari312T2.jpg/640px-LaudaNiki19760731Ferrari312T2.jpg',
  'ferrari_458':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Ferrari_458_Italia_%E2%80%93_Frontansicht_%281%29%2C_21._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg/640px-Ferrari_458_Italia_%E2%80%93_Frontansicht_%281%29%2C_21._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg',
  'ferrari_458_gt2':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ferrari_458_Italia_GT2_-_Flickr_-_exfordy.jpg/640px-Ferrari_458_Italia_GT2_-_Flickr_-_exfordy.jpg',
  'ferrari_458_s3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Ferrari_458_Italia_%E2%80%93_Frontansicht_%281%29%2C_21._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg/640px-Ferrari_458_Italia_%E2%80%93_Frontansicht_%281%29%2C_21._M%C3%A4rz_2012%2C_D%C3%BCsseldorf.jpg',
  'ferrari_599xxevo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ferrari_599XX_Evoluzione_%288014717939%29.jpg/640px-Ferrari_599XX_Evoluzione_%288014717939%29.jpg',
  'ferrari_f40':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/F40_Ferrari_20090509.jpg/640px-F40_Ferrari_20090509.jpg',
  'ferrari_f40_s3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/F40_Ferrari_20090509.jpg/640px-F40_Ferrari_20090509.jpg',
  'ks_ferrari_250_gto':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/1962Ferrari250GTO.jpg/640px-1962Ferrari250GTO.jpg',
  'ks_ferrari_330_p4':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Ferrari_1967_330_P4.jpg/640px-Ferrari_1967_330_P4.jpg',
  'ks_ferrari_488_challenge_evo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ferrari_488_Challenge_Evo_%2849081449378%29.jpg/640px-Ferrari_488_Challenge_Evo_%2849081449378%29.jpg',
  'ks_ferrari_488_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Ferrari_488_GT3_%2830597497755%29.jpg/640px-Ferrari_488_GT3_%2830597497755%29.jpg',
  'ks_ferrari_488_gtb':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Ferrari_488_GTB_at_Geneva_International_Motor_Show_2015_%28Ank_Kumar%29_06.jpg/640px-Ferrari_488_GTB_at_Geneva_International_Motor_Show_2015_%28Ank_Kumar%29_06.jpg',
  'ks_ferrari_812_superfast':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ferrari_812_Superfast_IMG_0498.jpg/640px-Ferrari_812_Superfast_IMG_0498.jpg',
  'ks_ferrari_f138':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ferrari_F138_%2852727486173%29.jpg/640px-Ferrari_F138_%2852727486173%29.jpg',
  'ks_ferrari_f2004':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Ferrari_F2004_front-right_Museo_Ferrari.jpg/640px-Ferrari_F2004_front-right_Museo_Ferrari.jpg',
  'ks_ferrari_f8_tributo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ferrari_F8_Tributo_Genf_2019_1Y7A5765.jpg/640px-Ferrari_F8_Tributo_Genf_2019_1Y7A5765.jpg',
  'ks_ferrari_fxx_k':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ferrari_FXX-K_%2817851550599%29.jpg/640px-Ferrari_FXX-K_%2817851550599%29.jpg',
  'ks_ferrari_laferrari':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/LaFerrari.jpg/640px-LaFerrari.jpg',
  'ks_ferrari_sf15t':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Formula_One_2015_Silverstone_test_-_Vettel_%2818371965204%29.jpg/640px-Formula_One_2015_Silverstone_test_-_Vettel_%2818371965204%29.jpg',
  'ks_ferrari_sf70h':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Sebastian_Vettel_2017_Catalonia_test_%2827_Feb-2_Mar%29_Day_1_2.jpg/640px-Sebastian_Vettel_2017_Catalonia_test_%2827_Feb-2_Mar%29_Day_1_2.jpg',
  'p4-5_2011':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Festival_automobile_international_2011_-_Ferrari_P_4-5_-_02.jpg/640px-Festival_automobile_international_2011_-_Ferrari_P_4-5_-_02.jpg',

  // ─── Ford ───────────────────────────────────────────────────────────
  'ks_ford_escort_mk1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Ford_Escort_MkI_RS2000.jpg/640px-Ford_Escort_MkI_RS2000.jpg',
  'ks_ford_gt':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2017_Ford_GT_%2838736055362%29.jpg/640px-2017_Ford_GT_%2838736055362%29.jpg',
  'ks_ford_gt40':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Ford_GT40_Mk_I%2C_1968.jpg/640px-Ford_GT40_Mk_I%2C_1968.jpg',
  'ks_ford_mustang_2015':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ford_Mustang_GT_5.0_%28VI%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Ford_Mustang_GT_5.0_%28VI%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',

  // ─── Glickenhaus ────────────────────────────────────────────────────
  'ks_glickenhaus_scg003':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/SCG_003S_at_Geneva_2015_%2816662005229%29.jpg/640px-SCG_003S_at_Geneva_2015_%2816662005229%29.jpg',

  // ─── KTM ────────────────────────────────────────────────────────────
  'ktm_xbow_r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/KTM_X-Bow_%286065182872%29.jpg/640px-KTM_X-Bow_%286065182872%29.jpg',

  // ─── Lamborghini ────────────────────────────────────────────────────
  'ks_lamborghini_aventador_sv':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Lamborghini_Aventador_LP_750-4_Superveloce_%2820691176743%29.jpg/640px-Lamborghini_Aventador_LP_750-4_Superveloce_%2820691176743%29.jpg',
  'ks_lamborghini_countach':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Lamborghini_Countach_at_Legendy_2014.jpg/640px-Lamborghini_Countach_at_Legendy_2014.jpg',
  'ks_lamborghini_countach_s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Lamborghini_Countach_at_Legendy_2014.jpg/640px-Lamborghini_Countach_at_Legendy_2014.jpg',
  'ks_lamborghini_gallardo_sl':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lamborghini_Gallardo_Superleggera_%28front%29.jpg/640px-Lamborghini_Gallardo_Superleggera_%28front%29.jpg',
  'ks_lamborghini_gallardo_sl_s3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lamborghini_Gallardo_Superleggera_%28front%29.jpg/640px-Lamborghini_Gallardo_Superleggera_%28front%29.jpg',
  'ks_lamborghini_huracan_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lamborghini_Hurac%C3%A1n_GT3_%2825792780455%29.jpg/640px-Lamborghini_Hurac%C3%A1n_GT3_%2825792780455%29.jpg',
  'ks_lamborghini_huracan_performante':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lamborghini_Hurac%C3%A1n_Performante_IMG_0916.jpg/640px-Lamborghini_Hurac%C3%A1n_Performante_IMG_0916.jpg',
  'ks_lamborghini_huracan_st':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Lamborghini_Hurac%C3%A1n_LP_620-2_Super_Trofeo_%2815223281137%29.jpg/640px-Lamborghini_Hurac%C3%A1n_LP_620-2_Super_Trofeo_%2815223281137%29.jpg',
  'ks_lamborghini_miura_sv':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/1972_Lamborghini_Miura_SV.jpg/640px-1972_Lamborghini_Miura_SV.jpg',
  'ks_lamborghini_sesto_elemento':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Lamborghini_Sesto_Elemento_%287105181031%29.jpg/640px-Lamborghini_Sesto_Elemento_%287105181031%29.jpg',

  // ─── Lotus ──────────────────────────────────────────────────────────
  'lotus_2_eleven':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Lotus_2-eleven.jpg/640px-Lotus_2-eleven.jpg',
  'lotus_2_eleven_gt4':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Lotus_2-eleven.jpg/640px-Lotus_2-eleven.jpg',
  'lotus_49':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Lotus_49-1.jpg/640px-Lotus_49-1.jpg',
  'lotus_98t':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Lotus_98T_Brands_Hatch_2005.jpg/640px-Lotus_98T_Brands_Hatch_2005.jpg',
  'lotus_elise_sc':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lotus_Elise_SC_220_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Elise_SC_220_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_elise_sc_s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lotus_Elise_-_Flickr_-_Alexandre_Pr%C3%A9vot_%283%29.jpg/640px-Lotus_Elise_-_Flickr_-_Alexandre_Pr%C3%A9vot_%283%29.jpg',
  'lotus_elise_sc_s2':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lotus_Elise_SC_220_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Elise_SC_220_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_evora_gtc':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lotus_Evora_GTE_%286143225779%29.jpg/640px-Lotus_Evora_GTE_%286143225779%29.jpg',
  'lotus_evora_gte':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lotus_Evora_GTE_%286143225779%29.jpg/640px-Lotus_Evora_GTE_%286143225779%29.jpg',
  'lotus_evora_gte_carbon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lotus_Evora_GTE_%286143225779%29.jpg/640px-Lotus_Evora_GTE_%286143225779%29.jpg',
  'lotus_evora_gx':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lotus_Evora_GTE_%286143225779%29.jpg/640px-Lotus_Evora_GTE_%286143225779%29.jpg',
  'lotus_evora_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Lotus_Evora_S_%E2%80%93_Frontansicht_%281%29%2C_30._August_2012%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Evora_S_%E2%80%93_Frontansicht_%281%29%2C_30._August_2012%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_240':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_240_s3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_s_roadster':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_scura':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exige_v6_cup':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Lotus_Exige_S_%E2%80%93_Frontansicht%2C_7._August_2011%2C_D%C3%BCsseldorf.jpg',
  'lotus_exos_125':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Lotus_T125_Exos_%286269084262%29.jpg/640px-Lotus_T125_Exos_%286269084262%29.jpg',
  'lotus_exos_125_s1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Lotus_T125_Exos_%286269084262%29.jpg/640px-Lotus_T125_Exos_%286269084262%29.jpg',

  // ─── Maserati ───────────────────────────────────────────────────────
  'ks_maserati_250f_6cyl':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Maserati_250F_front-left_Donington_Grand_Prix_Collection.jpg/640px-Maserati_250F_front-left_Donington_Grand_Prix_Collection.jpg',
  'ks_maserati_250f_12cyl':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Maserati_250F_front-left_Donington_Grand_Prix_Collection.jpg/640px-Maserati_250F_front-left_Donington_Grand_Prix_Collection.jpg',
  'ks_maserati_gt_mc_gt4':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Maserati_GranTurismo_MC_Stradale_%E2%80%93_Frontansicht%2C_30._August_2012%2C_D%C3%BCsseldorf.jpg/640px-Maserati_GranTurismo_MC_Stradale_%E2%80%93_Frontansicht%2C_30._August_2012%2C_D%C3%BCsseldorf.jpg',
  'ks_maserati_levante':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Maserati_Levante_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Maserati_Levante_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_maserati_mc12':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/MC12_stradale.JPG/640px-MC12_stradale.JPG',

  // ─── Mazda ──────────────────────────────────────────────────────────
  'ks_mazda_787b':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mazda_787B_in_the_Mazda_Museum.jpg/640px-Mazda_787B_in_the_Mazda_Museum.jpg',
  'ks_mazda_mx5_cup':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Mazda_MX-5_%28ND%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Mazda_MX-5_%28ND%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_mazda_mx5_nd':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Mazda_MX-5_%28ND%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Mazda_MX-5_%28ND%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_mazda_rx7_spirit_r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mazda-RX-7-%28FD%29-front.jpg/640px-Mazda-RX-7-%28FD%29-front.jpg',
  'ks_mazda_rx7_tuned':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mazda-RX-7-%28FD%29-front.jpg/640px-Mazda-RX-7-%28FD%29-front.jpg',

  // ─── McLaren ────────────────────────────────────────────────────────
  'mclaren_mp412c':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/McLaren_MP4-12C_%287522427256%29.jpg/640px-McLaren_MP4-12C_%287522427256%29.jpg',
  'mclaren_mp412c_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/McLaren_12C_GT3_%2810330558454%29.jpg/640px-McLaren_12C_GT3_%2810330558454%29.jpg',
  'ks_mclaren_650_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2015_McLaren_650S_GT3_%2819443180443%29.jpg/640px-2015_McLaren_650S_GT3_%2819443180443%29.jpg',
  'ks_mclaren_f1_gtr':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/McLaren_F1_GTR_1997.jpg/640px-McLaren_F1_GTR_1997.jpg',
  'ks_mclaren_p1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/McLaren_P1_%289834846576%29.jpg/640px-McLaren_P1_%289834846576%29.jpg',
  'ks_mclaren_p1_gtr':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/McLaren_P1_GTR_%2818640tried01543%29.jpg/640px-McLaren_P1_GTR_%2818640tried01543%29.jpg',

  // ─── Mercedes ───────────────────────────────────────────────────────
  'mercedes_sls':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mercedes-Benz_SLS_AMG_%28C197%29_%E2%80%93_Frontansicht_ge%C3%B6ffnet%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg/640px-Mercedes-Benz_SLS_AMG_%28C197%29_%E2%80%93_Frontansicht_ge%C3%B6ffnet%2C_10._August_2011%2C_D%C3%BCsseldorf.jpg',
  'mercedes_sls_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mercedes-Benz_SLS_AMG_GT3_%287664641474%29.jpg/640px-Mercedes-Benz_SLS_AMG_GT3_%287664641474%29.jpg',
  'ks_mercedes_190_evo2':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Mercedes-Benz_190_E_2.5-16_Evolution_II_%287985071917%29.jpg/640px-Mercedes-Benz_190_E_2.5-16_Evolution_II_%287985071917%29.jpg',
  'ks_mercedes_amg_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Mercedes-AMG_GT3_%2827289823122%29.jpg/640px-Mercedes-AMG_GT3_%2827289823122%29.jpg',
  'ks_mercedes_amg_gt3_evo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Mercedes-AMG_GT3_%2827289823122%29.jpg/640px-Mercedes-AMG_GT3_%2827289823122%29.jpg',
  'ks_mercedes_c9':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Sauber_Mercedes_C9_%288012094878%29.jpg/640px-Sauber_Mercedes_C9_%288012094878%29.jpg',

  // ─── Nissan ─────────────────────────────────────────────────────────
  'ks_nissan_370z':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nissan_370Z.jpg/640px-Nissan_370Z.jpg',
  'ks_nissan_370z_nismo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nissan_370Z.jpg/640px-Nissan_370Z.jpg',
  'ks_nissan_gtr':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Nissan_GT-R_MY2017_%281%29.jpg/640px-Nissan_GT-R_MY2017_%281%29.jpg',
  'ks_nissan_gtr_gt3':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Nissan_GT-R_NISMO_GT3.jpg/640px-Nissan_GT-R_NISMO_GT3.jpg',
  'ks_nissan_skyline_r34':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Nissan_Skyline_R34_GT-R_N%C3%BCr_001.jpg/640px-Nissan_Skyline_R34_GT-R_N%C3%BCr_001.jpg',

  // ─── Pagani ─────────────────────────────────────────────────────────
  'pagani_huayra':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Geneva_MotorShow_2013_-_Pagani_Huayra_front_right_view.jpg/640px-Geneva_MotorShow_2013_-_Pagani_Huayra_front_right_view.jpg',
  'pagani_zonda_r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pagani_Zonda_R_%286299053023%29.jpg/640px-Pagani_Zonda_R_%286299053023%29.jpg',

  // ─── Porsche ────────────────────────────────────────────────────────
  'ks_porsche_356_a_1600_gs_carrera_gt':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Porsche_356A_Carrera_GS_Speedster.jpg/640px-Porsche_356A_Carrera_GS_Speedster.jpg',
  'ks_porsche_550_a_spyder':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Porsche_550_Spyder_rear.jpg/640px-Porsche_550_Spyder_rear.jpg',
  'ks_porsche_718_boxster_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Porsche_718_Boxster_S_%28982%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Porsche_718_Boxster_S_%28982%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_porsche_718_boxster_s_pdk':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Porsche_718_Boxster_S_%28982%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Porsche_718_Boxster_S_%28982%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_porsche_718_cayman_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/2017_Porsche_718_Cayman_S_%2825390735477%29.jpg/640px-2017_Porsche_718_Cayman_S_%2825390735477%29.jpg',
  'ks_porsche_718_spyder_rs':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Porsche_550_Spyder_rear.jpg/640px-Porsche_550_Spyder_rear.jpg',
  'ks_porsche_908_lh':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Porsche_908_LH_Coup%C3%A9_%281968%29_1X7A8007.jpg/640px-Porsche_908_LH_Coup%C3%A9_%281968%29_1X7A8007.jpg',
  'ks_porsche_911_carrera_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Porsche_911_Carrera_S_%287522427256%29.jpg/640px-Porsche_911_Carrera_S_%287522427256%29.jpg',
  'ks_porsche_911_gt1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Porsche_911_GT1_%2710045%2C_Porsche_Museum%2C_2009.jpg/640px-Porsche_911_GT1_%2710045%2C_Porsche_Museum%2C_2009.jpg',
  'ks_porsche_911_gt3_cup_2017':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Porsche_911_GT3_Cup_%28991%29.jpg/640px-Porsche_911_GT3_Cup_%28991%29.jpg',
  'ks_porsche_911_gt3_r_2016':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Porsche_911_GT3_R_%2833055497914%29.jpg/640px-Porsche_911_GT3_R_%2833055497914%29.jpg',
  'ks_porsche_911_gt3_rs':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/2015_Porsche_911_GT3_RS_%28991%29_%2820848175498%29.jpg/640px-2015_Porsche_911_GT3_RS_%28991%29_%2820848175498%29.jpg',
  'ks_porsche_911_r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Porsche_911_R_TCE.jpg/640px-Porsche_911_R_TCE.jpg',
  'ks_porsche_911_rsr_2017':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Porsche_911_RSR_%2891%29_Le_Mans_2017.jpg/640px-Porsche_911_RSR_%2891%29_Le_Mans_2017.jpg',
  'ks_porsche_917_30':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Porsche_917-30_%28Porsche_Rennsport_Reunion_IV%29.jpg/640px-Porsche_917-30_%28Porsche_Rennsport_Reunion_IV%29.jpg',
  'ks_porsche_917_k':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Porsche_917K_%28Porsche_Museum%29.jpg/640px-Porsche_917K_%28Porsche_Museum%29.jpg',
  'ks_porsche_918_spyder':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Porsche_918_Spyder_IAA_2013.jpg/640px-Porsche_918_Spyder_IAA_2013.jpg',
  'ks_porsche_919_hybrid_2015':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Porsche_919_Hybrid_%2817087925992%29.jpg/640px-Porsche_919_Hybrid_%2817087925992%29.jpg',
  'ks_porsche_919_hybrid_2016':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Porsche_919_Hybrid_%2817087925992%29.jpg/640px-Porsche_919_Hybrid_%2817087925992%29.jpg',
  'ks_porsche_935_78_moby_dick':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Porsche_935-78_%22Moby_Dick%22_%286261854819%29.jpg/640px-Porsche_935-78_%22Moby_Dick%22_%286261854819%29.jpg',
  'ks_porsche_962c_longtail':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Porsche_962_%2810295310996%29.jpg/640px-Porsche_962_%2810295310996%29.jpg',
  'ks_porsche_962c_shorttail':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Porsche_962_%2810295310996%29.jpg/640px-Porsche_962_%2810295310996%29.jpg',
  'ks_porsche_991_carrera_s':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/2018_Porsche_911_Carrera_S_3.0.jpg/640px-2018_Porsche_911_Carrera_S_3.0.jpg',
  'ks_porsche_cayman_gt4_clubsport':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Porsche_Cayman_GT4_Clubsport_%2824543961579%29.jpg/640px-Porsche_Cayman_GT4_Clubsport_%2824543961579%29.jpg',
  'ks_porsche_cayman_gt4_std':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Porsche_Cayman_GT4_%2818505685858%29.jpg/640px-Porsche_Cayman_GT4_%2818505685858%29.jpg',
  'ks_porsche_macan':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Porsche_Macan_%E2%80%93_Frontansicht%2C_14._April_2014%2C_D%C3%BCsseldorf.jpg/640px-Porsche_Macan_%E2%80%93_Frontansicht%2C_14._April_2014%2C_D%C3%BCsseldorf.jpg',
  'ks_porsche_panamera':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Porsche_Panamera_4S_%28971%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg/640px-Porsche_Panamera_4S_%28971%29_%E2%80%93_Frontansicht%2C_24._Juni_2017%2C_D%C3%BCsseldorf.jpg',
  'ks_porsche_cayenne':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/2019_Porsche_Cayenne_V6_Automatic_3.0.jpg/640px-2019_Porsche_Cayenne_V6_Automatic_3.0.jpg',

  // ─── RUF ────────────────────────────────────────────────────────────
  'ks_ruf_rt12r':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/RUF_Rt_12_%28IAA_2005%29.jpg/640px-RUF_Rt_12_%28IAA_2005%29.jpg',
  'ks_ruf_rt12r_awd':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/RUF_Rt_12_%28IAA_2005%29.jpg/640px-RUF_Rt_12_%28IAA_2005%29.jpg',

  // ─── Shelby ─────────────────────────────────────────────────────────
  'shelby_cobra_427sc':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Shelby_Cobra_427_SC.jpg/640px-Shelby_Cobra_427_SC.jpg',

  // ─── Tatuus ─────────────────────────────────────────────────────────
  'tatuusfa1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Tatuus_FA010_%28Formula_Abarth%29.jpg/640px-Tatuus_FA010_%28Formula_Abarth%29.jpg',

  // ─── Toyota ─────────────────────────────────────────────────────────
  'ks_toyota_ae86':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Toyota_AE86_Coupe_01.jpg/640px-Toyota_AE86_Coupe_01.jpg',
  'ks_toyota_ae86_drift':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Toyota_AE86_Coupe_01.jpg/640px-Toyota_AE86_Coupe_01.jpg',
  'ks_toyota_ae86_tuned':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Toyota_AE86_Coupe_01.jpg/640px-Toyota_AE86_Coupe_01.jpg',
  'ks_toyota_celica_st185':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Toyota_Celica_GT-Four_ST185_001.JPG/640px-Toyota_Celica_GT-Four_ST185_001.JPG',
  'ks_toyota_gt86':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2012_Toyota_86_GTS_%28ZN6%29_coupe_%282012-10-26%29.jpg/640px-2012_Toyota_86_GTS_%28ZN6%29_coupe_%282012-10-26%29.jpg',
  'ks_toyota_supra_mkiv':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Toyota_Supra_in_Tokyo_02.jpg/640px-Toyota_Supra_in_Tokyo_02.jpg',
  'ks_toyota_supra_mkiv_drift':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Toyota_Supra_in_Tokyo_02.jpg/640px-Toyota_Supra_in_Tokyo_02.jpg',
  'ks_toyota_supra_mkiv_tuned':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Toyota_Supra_in_Tokyo_02.jpg/640px-Toyota_Supra_in_Tokyo_02.jpg',
  'ks_toyota_supra_mkiv_93':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Toyota_Supra_in_Tokyo_02.jpg/640px-Toyota_Supra_in_Tokyo_02.jpg',
};

/**
 * Look up an online image URL for a car by its AC car ID.
 * Returns null if the car is not in the official catalog (e.g., mods).
 */
export function getOnlineCarImageUrl(carId: string): string | null {
  return CAR_IMAGE_CATALOG[carId] ?? null;
}

export default CAR_IMAGE_CATALOG;
