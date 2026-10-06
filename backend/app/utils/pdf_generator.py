import base64
from io import BytesIO
from reportlab.lib.pagesizes import A4,landscape
from reportlab.pdfgen.canvas import Canvas

def generate_certificate(name,year,code):
 buf=BytesIO(); c=Canvas(buf,pagesize=landscape(A4)); w,h=landscape(A4)
 c.setTitle('Certificado Balanço Cidadão');c.setFont('Helvetica-Bold',28);c.drawCentredString(w/2,h-120,'CERTIFICADO')
 c.setFont('Helvetica',16);c.drawCentredString(w/2,h-190,'Certificamos que');c.setFont('Helvetica-Bold',24);c.drawCentredString(w/2,h-235,name)
 c.setFont('Helvetica',15);c.drawCentredString(w/2,h-280,f'concluiu a Trilha do Tesouro - exercício {year}.');c.setFont('Helvetica',10);c.drawCentredString(w/2,55,f'Código de verificação: {code}')
 c.showPage();c.save();return base64.b64encode(buf.getvalue()).decode()
