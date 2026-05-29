const faqData = [
  {
    q: "The English songs in the Our Music Time course materials are more difficult for children and teachers to learn in Taiwan. How to overcome it?",
    a: "Zoltán Kodály has always advocated learning music in the mother tongue, especially folk songs passed down from generation to generation. If children learn these folk songs, they should use the original language to learn the essence of music; in contrast, when children learn Chinese folk songs abroad, they also hope to learn in Chinese.",
  },
  {
    q: "Can the teachers translate the folk songs in English into Chinese for children to learn?",
    a: "My suggestion is not. As mentioned above, the reason is to let students feel the original meaning of the lyrics. The teachers can translate in advance to let students understand before teaching them to sing.",
  },
  {
    q: "How can I efficiently add all the Our Music Time lessons into individual piano lessons?",
    a: "The Kodály Method has always emphasized that children must undergo three procedures (3 Ps) to learn a new topic: Prepare, Present, and Practice. The teachers notice the 'Present' appearing in one of the activities in the lesson plan. They must bring this subject into the individual piano lessons because the themes learned through these three procedures can allow students to understand the subject's meaning cognitively.",
  },
  {
    q: "Is Our Music Time lesson plan only suitable for piano?",
    a: "No. All instruments, such as flute, violin, and percussion, can be used with the designed lessons.",
  },
  {
    q: "How do you simultaneously plan private lessons and match the My First Piano Adventure with Our Music Time lesson plans?",
    a: "The proportion of instrument lessons in Our Music Time lesson plans can increase according to the children's learning ability. Suppose a piano lesson is 60 minutes weekly for beginners or under five. In that case, the children can have 10-20 minutes for piano learning, and the remaining 40-50 minutes will focus on the Our Music Time curriculum.",
  },
  {
    q: "Can teachers use other piano textbooks?",
    a: "Of course! Suppose the teacher wants to keep using other piano textbooks for the current students. In that case, as long as the Our Music Time lesson plans are in a timely, appropriate manner according to the needs of each student.",
  },
  {
    q: "Are all Our Music Time lesson plans only suitable for children in preschool or beginners?",
    a: "Of course not! They are suitable for all ages at different levels. Suppose music teachers have trained using more pedagogy to assist their children's learning of instruments. Their students will find it easier to overcome any difficulty through understanding.",
  },
  {
    q: "How long do the students complete the Elementary, Intermediate, and Advanced levels courses?",
    a: "Each book has five topics and 1 to 7 lessons for each. The 6th and 7th lessons are for the general review and for preparing the next unit. Each level course takes about six months to one year. Students will complete three levels in less than three years, depending on the student's age and learning ability.",
  },
  {
    q: "How do we tell parents that 'Slow Learning' is a better concept than 'Faster Learning'?",
    a: "Parents nowadays want their children to learn instruments quickly. 'Learning slowly' lays a good foundation for children to learn music, focusing on the three essential elements of music: beat, rhythm, and intonation, so that the children can learn instruments from complicated to simple and make the most neglected experiment. Singing and listening to music should be established first, then instrument learning.",
  },
  {
    q: "Do Our Music Time courses have other things besides training children's audition dictation?",
    a: "Learning all aspects of music has always been our central philosophy. Through singing, tapping, the beat, and clapping the rhythm, children's brain integration ability is trained so that the left brain controls the right side of the body. Then, the right brain controls the left body and uses the integration ability of the brain to learn instrumental music. For example, the stability of the playing speed does not have to rely on the metronome or the practice of finger skills and musical expression. One's brain can control it and can focus on all-round learning.",
  },
  {
    q: "Is there a link to learn all the songs?",
    a: "All teachers participating in Our Music Time online training course will receive a Google link sung by our lovely singer, Aurelia, with the purest voice.",
  },
  {
    q: "What does the teacher use the size of the whiteboard in training courses?",
    a: "Chiunglien uses three sizes of whiteboard, all double-sided, for magnets. The three sizes of the whiteboard are as follows. Small Dimensions: L 12 x W16 inches Medium Dimensions: L 24 x W 18 inches Large Dimensions: L 24 x W 68 inches",
  },
  {
    q: "What do Our Music Time 2023 Online 15-week courses include?",
    a: "There is homework every week. Teachers must record short videos and discuss them to achieve the most incredible teaching results. Submit a complete unit video (at least 10 to 20 minutes) after each course level, which has been prepared for the qualification standard of Our Music Time. Every teacher participating in the course has 10-20 minutes of individual time weekly to analyze and discuss with the teacher. This discussion time is by appointment only. Contact us for more information on the course and tuition. You can pay it in installments.",
  },
  {
    q: "What are the requirements for becoming a certified Our Music Time teacher?",
    a: "You must complete the three-volume curriculum in the teacher training course. Submit 20-30 minutes of elementary, intermediate, and advanced teaching videos. It is necessary to purchase a complete set of Song Picture Magnetic and Felt Storybooks to supplement the courses in group or private lessons.",
  },
];

function initFAQ(data = faqData) {
  const container = document.getElementById("faq-container");
  if (!container) return;

  container.innerHTML = "";
  
  data.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "accordion-item reveal";
    // stagger animation slightly
    if (index % 3 === 1) itemEl.classList.add("delay-100");
    if (index % 3 === 2) itemEl.classList.add("delay-200");
    
    itemEl.innerHTML = `
      <div class="accordion-header">
        <span>${item.q}</span>
        <span class="accordion-icon">&#9660;</span>
      </div>
      <div class="accordion-body">
        <p>${item.a}</p>
      </div>
    `;
    
    const header = itemEl.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      // close others
      const currentActive = container.querySelector(".accordion-item.accordion-open");
      if (currentActive && currentActive !== itemEl) {
        currentActive.classList.remove("accordion-open");
      }
      
      itemEl.classList.toggle("accordion-open");
    });
    
    container.appendChild(itemEl);
  });
}
