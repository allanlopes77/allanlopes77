-- Sample data for local dev (run after 001_init.sql)
insert into clients (name, whatsapp_group_id, clickup_list_id, tone_instructions, notify_phone) values
  (
    'Loja das Flores',
    '5511999990001-group',
    '901234567890',
    'Responda de forma descontraída mas profissional. Use emojis com moderação. Evite textos longos.',
    '5511999990000'
  ),
  (
    'Clínica Saúde Total',
    '5511999990002-group',
    '901234567891',
    'Tom formal e tranquilizador. Mencione sempre prazo estimado de resposta quando relevante.',
    '5511999990000'
  );
