export async function GET() {
    try {
        const today = new Date();
        const age = today.getFullYear() - 2000
        const products = {
            "About Me":[
                `${age} Year Old`,
                `Graduate From SMAN 01 Karanganyar`,
                `Graduate From University Muhammadiyah Surakarta`,
                `Live in Karanganyar, Central Java, Indonesia`,
            ],
            "Code that used":[
                "Python",
                "Javascript",
                "Java",
                "Typescript"
            ],
            "Public API That I Used":[
                "Google User API",
                "Google Mail API",
                "Google Classroom API",
            ],
            "Portofolio":[
                {
                    "title":"Projects",
                    "result":[
                        {
                            "title":"Teknologi Umum Blog",
                            "urls":"https://github.com/teknologi-umum/blog"
                        },
                        {
                            "title":"Spectator [Data Generator]",
                            "urls":"https://github.com/teknologi-umum/spectator"
                        },
                        {
                            "title":"MR-Package [Backend Developer]",
                            "urls":"https://mr-package.com/"
                        },
                        {
                            "title":"MySyllabus [Backend Developer]"
                        }
                    ],
                },
                {
                    "title":"Seminars",
                    "result":[
                        {
                            "title":"",
                            "time":"",
                        },
                        {
                            "title":"",
                            "time":"",
                        },
                        {
                            "title":"",
                            "time":"",
                        },
                        {
                            "title":"",
                            "time":"",
                        },
                        {
                            "title":"",
                            "time":"",
                        },
                        
                    ],
                },
            ],
            "Find Me":[
                {
                    "title":"",
                    "icon":"",
                    "link":"LinkedIn"
                },
                {
                    "title":"",
                    "icon":"",
                    "link":"https://api.whatsapp.com/send?phone=6285607555744&text=%20"
                },
            ]
        }
      return new Response(JSON.stringify(products), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
    }
  }
  