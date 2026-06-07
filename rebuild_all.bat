@echo off
python update_generators.py
python generate_all_reports.py
python generate_ref_table_report.py
python generate_ref_report.py
python add_click_scripts.py
python add_toggles.py
python modernize.py
python revert_styles_and_add_collapse.py
python fix_toggles_css.py
python restore_modern_colors.py
python final_fix.py
python add_back_to_top.py
python hide_seq.py
echo All reports rebuilt successfully!
