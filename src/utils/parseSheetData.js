export function parseSheetData(rawData) {
  if (!Array.isArray(rawData)) return [];

  const topicMap = {};

  rawData.forEach(item => {
    const topic = item.topic || "Untitled Topic";
    const subTopic = item.subTopic || "General";

    if (!topicMap[topic]) {
      topicMap[topic] = {
        id: crypto.randomUUID(),
        title: topic,
        subTopics: {}
      };
    }

    if (!topicMap[topic].subTopics[subTopic]) {
      topicMap[topic].subTopics[subTopic] = {
        id: crypto.randomUUID(),
        title: subTopic,
        questions: []
      };
    }

    topicMap[topic].subTopics[subTopic].questions.push({
      id: item._id || crypto.randomUUID(),
      text: item.title || item.questionId?.name || "Untitled Question",
      link: item.questionId?.problemUrl || ""
    });
  });

  return Object.values(topicMap).map(topic => ({
    ...topic,
    subTopics: Object.values(topic.subTopics)
  }));
}
