"""Bancos de datos para crear perfiles de demostración peruanos (nombres, categorías, textos).

Todo es inventado: los nombres son combinaciones de nombres y apellidos comunes en el Perú, y las empresas, negocios y
enlaces de los proyectos no existen."""

FIRST_NAMES_F = [
    "Camila", "Valeria", "Rocío", "Andrea", "Daniela", "Fiorella", "Milagros", "Lucía", "Paola", "Jimena", "Yesenia",
    "Estefany", "Katherine", "Mariela", "Sofía", "Gabriela", "Carla", "Diana", "Noelia", "Brenda", "Claudia", "Elena",
    "Flor", "Giovanna", "Helen", "Ingrid", "Judith", "Karla", "Liliana", "Marisol", "Nataly", "Olenka", "Patricia",
    "Rosario", "Silvana", "Tatiana", "Ursula", "Vanessa", "Ximena", "Yanira",
]
FIRST_NAMES_M = [
    "Diego", "Luis", "Jhon", "Miguel Ángel", "Renzo", "Marco", "Sergio", "Cristian", "Jorge", "Álvaro", "Brayan",
    "Édgar", "Fabrizio", "Gustavo", "Henry", "Iván", "Joel", "Kevin", "Mauricio", "Nilton", "Óscar", "Percy", "Rodrigo",
    "Wilmer", "Adrián", "Bruno", "César", "Darío", "Eduardo", "Fernando", "Gonzalo", "Héctor", "Julio", "Leonardo",
    "Manuel", "Nicolás", "Omar", "Pablo", "Raúl", "Santiago",
]
SURNAMES = [
    "Huamán", "Quispe", "Condori", "Mamani", "Chávez", "Flores", "Paucar", "Ríos", "Mendoza", "Ticona", "Salas",
    "Vargas", "Rojas", "Torres", "Ccopa", "Salazar", "Alarcón", "Tello", "Gutiérrez", "Yupanqui", "Díaz", "Cárdenas",
    "Ortega", "Castillo", "Ramos", "Suárez", "Vásquez", "Palomino", "Huanca", "Apaza", "Cruz", "Espinoza", "Gamarra",
    "Zevallos", "León", "Medina", "Ñahui", "Pariona", "Sulca", "Tapia", "Valdivia", "Zegarra", "Arce", "Bautista",
    "Carrasco", "Delgado", "Escobar", "Fernández", "Guevara", "Herrera", "Ibáñez", "Julca", "Llanos", "Miranda",
    "Navarro", "Olivera", "Pacheco", "Quiroz", "Reátegui", "Sandoval", "Tarazona", "Urquizo", "Villanueva", "Yarlequé",
    "Aguilar", "Benavides", "Contreras", "Domínguez", "Estrada", "Figueroa", "Gómez", "Hidalgo", "Infante", "Jara",
    "Lazo", "Montalvo", "Neyra", "Orellana", "Peralta", "Rivera", "Soto", "Trujillo", "Ugarte", "Vera",
]
CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Huancayo", "Iquitos", "Tacna", "Cajamarca", "Ayacucho", "Puno"]
UNIVERSITIES = [
    "Universidad Nacional Mayor de San Marcos", "Pontificia Universidad Católica del Perú", "Universidad Nacional de Ingeniería",
    "Universidad Peruana de Ciencias Aplicadas", "Universidad de Lima", "Universidad Continental", "Universidad Señor de Sipán",
    "Universidad Tecnológica del Perú", "Universidad Nacional de San Agustín", "Universidad Nacional de Trujillo",
    "Universidad Nacional San Antonio Abad del Cusco", "Universidad César Vallejo", "Universidad Católica San Pablo",
]
COMPANIES = [
    "Andes Digital", "Pacífico Labs", "Inka Soft", "Kuntur Studio", "Qori Creativa", "Tawa Tech", "Sumaq Agencia",
    "Pachamama Digital", "Wiracocha Systems", "Amaru Consultores", "Chaski Software", "Illari Media", "Yachay Lab",
    "Mayu Estudio", "Sayri Data", "Puma Creativos",
]
LEVELS_EN = ["Básico", "Intermedio", "Intermedio", "Avanzado"]
DIFFERENTIATORS = [
    "Entrego avances cada semana", "Comunicación clara y constante", "Soporte después de la entrega", "Precios transparentes, sin sorpresas",
    "Cumplo los plazos acordados", "Trabajo con brief y objetivos medibles", "Atención en horario de Lima", "Documento todo lo que entrego",
]
INTROS = [
    "Soy {name}, {specialty}.",
    "Me llamo {name} y trabajo como {specialty}.",
    "Hola, soy {name}: {specialty}.",
    "Soy {name}, {specialty} con enfoque en negocios y emprendimientos peruanos.",
]
CLOSERS = [
    "Trabajo desde {city}, Perú, y me adapto al horario de mis clientes.",
    "Vivo en {city} y atiendo proyectos de todo el país.",
    "Estoy en {city}. Puedo reunirme por videollamada cuando lo necesites.",
    "Desde {city} trabajo con emprendedores y empresas de todo el Perú.",
]

# Por categoría: especialidades, habilidades, herramientas, estudios, cargos, servicios, proyectos de portafolio y precio base
CATEGORY_DATA = {
    "Desarrollo Web": {
        "specialties": ["Desarrollador front-end con React", "Desarrollador full stack con Node.js", "Desarrolladora web con WordPress y Shopify", "Desarrollador back-end con Python y Django"],
        "skills": ["React", "Next.js", "Node.js", "Python", "Django", "TypeScript", "PostgreSQL", "WordPress", "Tailwind CSS", "APIs REST", "Landing pages", "Shopify"],
        "tools": ["Git", "GitHub", "VS Code", "Figma", "Docker", "Vercel", "Postman"],
        "degrees": ["Ingeniería de sistemas", "Ingeniería de software", "Ciencias de la computación"],
        "roles": ["Desarrollador web", "Desarrollador front-end", "Desarrollador full stack"],
        "services": ["páginas web y landing pages", "tiendas en línea", "aplicaciones web a medida", "integración con pasarelas de pago"],
        "projects": [("Tienda en línea para {biz}", ["React", "Node.js", "PostgreSQL"]), ("Página web institucional de {biz}", ["Next.js", "Tailwind CSS"]), ("Sistema de reservas para {biz}", ["Django", "PostgreSQL"])],
        "price": 150, "unit": "semanas",
    },
    "Desarrollo Mobile": {
        "specialties": ["Desarrollador de apps móviles con Flutter", "Desarrolladora móvil con React Native", "Desarrollador Android con Kotlin", "Desarrollador de apps híbridas"],
        "skills": ["Flutter", "Dart", "React Native", "Kotlin", "Android", "iOS", "Firebase", "Publicación en Play Store", "Notificaciones push", "APIs REST"],
        "tools": ["Android Studio", "Xcode", "Git", "Firebase", "Figma", "Postman"],
        "degrees": ["Ingeniería de sistemas", "Ingeniería de software", "Ingeniería informática"],
        "roles": ["Desarrollador móvil", "Desarrollador Android", "Desarrollador Flutter"],
        "services": ["apps móviles para Android y iOS", "publicación en las tiendas", "integración con servicios en la nube", "mantenimiento de apps existentes"],
        "projects": [("App de pedidos para {biz}", ["Flutter", "Firebase"]), ("App de fidelización de clientes de {biz}", ["React Native", "Firebase"]), ("App de seguimiento de entregas de {biz}", ["Kotlin", "Android"])],
        "price": 220, "unit": "semanas",
    },
    "Diseño UI/UX": {
        "specialties": ["Diseñadora de interfaces para apps y web", "Diseñador UX e investigación de usuarios", "Diseñador de producto digital", "Diseñadora de sistemas de diseño"],
        "skills": ["Diseño de interfaces", "Prototipado", "Investigación de usuarios", "Sistemas de diseño", "Wireframes", "Diseño responsive", "Accesibilidad", "Pruebas de usabilidad", "Branding"],
        "tools": ["Figma", "Adobe XD", "Miro", "Notion", "Illustrator", "Photoshop"],
        "degrees": ["Diseño gráfico", "Diseño industrial", "Comunicación audiovisual"],
        "roles": ["Diseñador UI/UX", "Diseñador de producto", "Diseñador de interfaces"],
        "services": ["diseño de interfaces para web y móvil", "prototipos interactivos", "sistemas de diseño", "pruebas de usabilidad"],
        "projects": [("Rediseño de la app de {biz}", ["Figma", "Prototipado"]), ("Sistema de diseño para {biz}", ["Figma", "Sistemas de diseño"]), ("Diseño de la web de {biz}", ["Figma", "Diseño responsive"])],
        "price": 130, "unit": "semanas",
    },
    "Marketing Digital": {
        "specialties": ["Estrategia de redes sociales y publicidad pagada", "Especialista en Meta Ads y Google Ads", "Estratega de marketing de contenidos", "Especialista en SEO y analítica web"],
        "skills": ["Meta Ads", "Google Ads", "SEO", "Email marketing", "Analítica web", "Estrategia de contenidos", "Embudos de venta", "Marketing de influencers", "Copywriting"],
        "tools": ["Google Analytics", "Meta Business Suite", "Canva", "Mailchimp", "Notion", "Semrush"],
        "degrees": ["Marketing", "Administración y marketing", "Publicidad", "Comunicación"],
        "roles": ["Especialista en marketing digital", "Analista de marketing", "Gestor de campañas"],
        "services": ["campañas de publicidad pagada", "estrategia de contenidos", "posicionamiento SEO", "reportes de resultados"],
        "projects": [("Campaña de lanzamiento para {biz}", ["Meta Ads", "Google Analytics"]), ("Estrategia de contenidos de {biz}", ["Canva", "Notion"]), ("Posicionamiento SEO de {biz}", ["SEO", "Semrush"])],
        "price": 120, "unit": "semanas",
    },
    "Redacción": {
        "specialties": ["Redactora de contenido y copywriting", "Redactor técnico y de blogs", "Copywriter para marcas y redes", "Redactor de guiones y contenido audiovisual"],
        "skills": ["Copywriting", "Redacción SEO", "Blogs", "Guiones", "Corrección de estilo", "Storytelling", "Notas de prensa", "Newsletters", "Contenido para redes"],
        "tools": ["Google Docs", "Notion", "Grammarly", "Canva", "Trello", "Slack"],
        "degrees": ["Ciencias de la comunicación", "Literatura", "Periodismo", "Lingüística"],
        "roles": ["Redactor de contenido", "Copywriter", "Editor de contenidos"],
        "services": ["artículos para blogs", "textos para páginas web", "guiones para video", "corrección y edición de textos"],
        "projects": [("Blog corporativo de {biz}", ["Redacción SEO", "Blogs"]), ("Textos de la web de {biz}", ["Copywriting", "Storytelling"]), ("Newsletter mensual de {biz}", ["Newsletters", "Mailchimp"])],
        "price": 80, "unit": "semanas",
    },
    "Datos e IA": {
        "specialties": ["Analista de datos y dashboards", "Científico de datos con Python", "Ingeniero de datos", "Especialista en inteligencia artificial aplicada"],
        "skills": ["Python", "SQL", "Power BI", "Pandas", "Machine learning", "Visualización de datos", "ETL", "Estadística", "Excel avanzado", "Tableau"],
        "tools": ["Jupyter", "Power BI", "Tableau", "PostgreSQL", "Git", "Google Colab"],
        "degrees": ["Estadística", "Ingeniería industrial", "Ingeniería de sistemas", "Matemática"],
        "roles": ["Analista de datos", "Científico de datos", "Analista de inteligencia de negocios"],
        "services": ["dashboards de gestión", "limpieza y análisis de datos", "modelos predictivos", "automatización de reportes"],
        "projects": [("Dashboard de ventas de {biz}", ["Power BI", "SQL"]), ("Modelo de predicción de demanda de {biz}", ["Python", "Pandas"]), ("Automatización de reportes de {biz}", ["Python", "SQL"])],
        "price": 190, "unit": "semanas",
    },
    "DevOps": {
        "specialties": ["Ingeniero DevOps en la nube", "Especialista en infraestructura y despliegues", "Ingeniero de confiabilidad", "Administrador de sistemas cloud"],
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "GitHub Actions", "Monitoreo", "Bases de datos", "Seguridad en la nube"],
        "tools": ["GitHub Actions", "Docker", "Terraform", "Grafana", "AWS", "Linux"],
        "degrees": ["Ingeniería de sistemas", "Ingeniería de telecomunicaciones", "Ingeniería informática"],
        "roles": ["Ingeniero DevOps", "Administrador de sistemas", "Ingeniero cloud"],
        "services": ["despliegues automatizados", "infraestructura en la nube", "monitoreo y alertas", "optimización de costos en la nube"],
        "projects": [("Pipeline de despliegue para {biz}", ["GitHub Actions", "Docker"]), ("Migración a la nube de {biz}", ["AWS", "Terraform"]), ("Monitoreo de los sistemas de {biz}", ["Grafana", "Linux"])],
        "price": 240, "unit": "semanas",
    },
    "Community Management": {
        "specialties": ["Gestión de redes para emprendimientos", "Community manager para marcas locales", "Creador de contenido para redes", "Especialista en atención y comunidad digital"],
        "skills": ["Gestión de redes sociales", "Calendario de contenidos", "Atención al cliente", "Reels y video corto", "Diseño en Canva", "Métricas de redes", "Escucha social", "Concursos y activaciones"],
        "tools": ["Canva", "Meta Business Suite", "Later", "CapCut", "Notion", "Trello"],
        "degrees": ["Ciencias de la comunicación", "Marketing", "Publicidad", "Comunicación audiovisual"],
        "roles": ["Community manager", "Gestor de redes", "Creador de contenido"],
        "services": ["calendario y publicación de contenidos", "atención a la comunidad", "videos cortos y reels", "reportes mensuales de métricas"],
        "projects": [("Gestión de redes de {biz}", ["Canva", "Meta Business Suite"]), ("Campaña de reels para {biz}", ["CapCut", "Canva"]), ("Calendario de contenidos de {biz}", ["Notion", "Later"])],
        "price": 90, "unit": "semanas",
    },
}
BUSINESSES = [
    "una cevichería en Lima", "una agencia de viajes en Cusco", "una cooperativa cafetalera de Chanchamayo", "un taller de cerámica en Chulucanas",
    "una clínica dental en Arequipa", "una academia preuniversitaria en Trujillo", "una panadería artesanal en Miraflores", "una bodega en Surco",
    "una tienda de ropa en Gamarra", "un restaurante en Piura", "una ferretería en Huancayo", "una inmobiliaria en Chiclayo", "un hostal en Puno",
    "una empresa de transporte en Tacna", "un gimnasio en San Isidro", "una distribuidora de abarrotes en Ayacucho", "una librería en Cajamarca",
]
BANNER_COLORS = ["bg-indigo-900", "bg-emerald-900", "bg-amber-900", "bg-rose-900", "bg-slate-900"]
PLAN_TEXT = {
    "basico": ("Ideal para empezar: un proyecto pequeño con entrega rápida.", "1", "2", [("Soporte después de la entrega", "7 días"), ("Entrega estimada", "7 días")]),
    "estandar": ("Para negocios que necesitan más alcance y acompañamiento.", "2", "3", [("Soporte después de la entrega", "15 días"), ("Entrega estimada", "14 días")]),
    "premium": ("Atención prioritaria y varios proyectos en paralelo.", "3", "5", [("Soporte después de la entrega", "30 días"), ("Entrega estimada", "21 días")]),
}
TIER_MULTIPLIER = {"basico": 1.0, "estandar": 1.9, "premium": 3.2}
