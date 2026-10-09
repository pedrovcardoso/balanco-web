KEYS=['HISTORIA_HQ','LIVRO_1','LIVRO_2','LIVRO_3','BALANCO_DADOS','SAIBA_MAIS']
async def get_trail_progress(db,uid):
 rows=await db.fetch_all('SELECT item_key,redeemed_at FROM tb_trail_redemption WHERE user_id=%s',(int(uid),));d={x['item_key']:x['redeemed_at'] for x in rows}
 return [{'itemKey':k,'redeemed':k in d,'redeemedAt':d.get(k)} for k in KEYS]
async def redeem(db,uid,key):
 await db.execute('INSERT INTO tb_trail_redemption(user_id,item_key) VALUES(%s,%s) ON DUPLICATE KEY UPDATE redeemed_at=redeemed_at',(int(uid),key));return {'itemKey':key,'redeemed':True}
