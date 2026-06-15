


import re
from spellchecker import SpellChecker

custom_fillers = {
    "hello",
    "hi",
    "hey",
    "hii",
    "yo",
    "i",
    "am",
    "name"
}

#words that should NEVER be corrected
protected_words = {
    "vins",
    "yaksha",
    "iit",
    "ropar",
    "vicharanashala",
    "vise",
    "vled",
    "vibe",
    "samagama",
    "yaksha",
    "rosetta",
    "spurti",
    "sp",
    "points",
    "summership",
    "vinternship",
    "pinternship",
    "annam",
    "hp",
    "yaksha",
    "chat",
    "talk",
    "interact",
    "#escalate",
    "#escalate-vibe",
    "#vibe-email",
    "platform",
    "progression",
    "honor",
    "code",
    "noc",
    "card",
    "offer",
    "letter",
    "zoom",
    "standup",
    "kickoff",
    "viva",
    "route",
    "ai",
    "summership",
    "lab",
    "yaksha-mini",
    "voice",
    "samagama"
}

spell = SpellChecker()

def preprocess_query(query):


    query = query.lower()

    # remove punctuation
    query = re.sub(r"[^\w\s]", "", query)


    tokens = query.split()

    corrected_tokens = []

    for word in tokens:

        #skip filler words
        if word in custom_fillers:
            continue

        #don't correct project-specific words
        if word in protected_words:
            corrected_tokens.append(word)
            continue

        #spell correction
        corrected_word = spell.correction(word)

        #if correction fails
        if corrected_word is None:
            corrected_word = word

        corrected_tokens.append(corrected_word)

    cleaned_query = " ".join(corrected_tokens)

    return cleaned_query











# import re
# import nltk


# from nltk.corpus import stopwords
# from nltk.tokenize import word_tokenize
# from nltk.stem import WordNetLemmatizer

# nltk.download('punkt')
# nltk.download('punkt_tab')
# nltk.download('stopwords')
# nltk.download('wordnet')

# # Download required data


# # Initialize tools
# stop_words = set(stopwords.words('english'))
# custom_stopwords = {
#     "hello",
#     "hi",
#     "hey",
#     "hii",
#     "yo",
#     "iam",
#     "im",
#     "name",
#     "shreya"
# }
# lemmatizer = WordNetLemmatizer()

# def preprocess_query(query):

#     # lowercase
#     query = query.lower()

#     # remove punctuation
#     query = re.sub(r"[^\w\s]", "", query)

#     # tokenize
#     tokens = word_tokenize(query)

#     # remove stopwords
#     all_stopwords = stop_words.union(custom_stopwords)

#     filtered_tokens = [
#         word for word in tokens
#         if word not in all_stopwords
#         ]

#     # lemmatization
#     lemmatized_tokens = [
#         lemmatizer.lemmatize(word)
#         for word in filtered_tokens
#     ]

#     # join words
#     cleaned_query = " ".join(lemmatized_tokens)

#     return cleaned_query






# import re
# from spellchecker import SpellChecker

# custom_fillers = {
#     "hello",
#     "hi",
#     "hey",
#     "hii",
#     "yo"
# }

# #words that should NEVER be corrected
# protected_words = {
#     "Vicharanashala","VINS","VISE","VLED","ViBe","Samagama","Yaksha","Rosetta","Spurti","SP","Points","sp","points","Summership","Vinternship","Pinternship","Annam","Bronze","Silver","Gold","Platinum","Health","HP","Yaksha","Chat","Talk","to","Yaksha","Interact","with","Yaksha","#escalate","#escalate-ViBe","#vibe-email","ViBe","Platform","ViBe","Learning","Platform","Linear","Progression","Access","Restricted","Quiet","Helper","Honor","Code","Participation","Agreement","NOC","Card","Offer","Letter","Card","Announcements","Section","Zoom","Standup","Daily","Standup","Kickoff","Orientation","Viva","Route","AI","Fundamentals","Penalty","Score","Study","Corner","Summership","2026","Vicharanashala","Lab","Vicharanashala","Lab","for","Education","Design","VLED","Lab","Yaksha-mini","Voice","Samagama"
# }

# spell = SpellChecker()

# def preprocess_query(query):


#     query = query.lower()

#     # remove punctuation
#     query = re.sub(r"[^\w\s]", "", query)


#     tokens = query.split()

#     corrected_tokens = []

#     for word in tokens:

#         #skip filler words
#         if word in custom_fillers:
#             continue

#         #don't correct project-specific words
#         if word in protected_words:
#             corrected_tokens.append(word)
#             continue

#         #spell correction
#         corrected_word = spell.correction(word)

#         #if correction fails
#         if corrected_word is None:
#             corrected_word = word

#         corrected_tokens.append(corrected_word)

#     cleaned_query = " ".join(corrected_tokens)

#     return cleaned_query