import random
import openai
import re
import time

LLM = None
TEST_TIMES = 20             #每个数字测试次数
MAX_FAIL = 10               #连续失败次数，超过这个次数则不再测试
TEST_START = 20             #测试的数字范围，从20到800，每次增加20
TEST_STOP = 800
TEST_SKIP = 20
TEST_MODELS = ["#gpt-4o-mini", "gpt-4o-2024-11-20", "claude-3-7-sonnet-20250219", "gemini-2.0-pro-exp-02-05", "grok-3",
    "DMXAPI-HuoShan-DeepSeek-V3", "glm-4-plus", "qwen-max-latest", "doubao-pro-128k"]

def SetLLM(llm_model):
    global LLM

    with open("api_key.txt", "r") as f:
        api_key = f.read().strip()

    #下面是把base_url改成了DMX API的地址，方便评测
    LLM = openai.OpenAI(api_key=api_key, base_url="https://www.dmxapi.com/v1")
    LLM.model = llm_model
    LLM.stream = False

def Test(llm_model, upper_number):
    SetLLM(llm_model)

    score = 0
    test_times_half = TEST_TIMES // 2

    for i in range(TEST_TIMES):
        if i == test_times_half and score > test_times_half // 2:
            score *= 2
            break           #如果前一半的测试结果正确率过半，则直接跳出循环，按正确率*2计算

        numbers = [i+1 for i in range(upper_number)]            #生成1到upper_number的数字

        random.shuffle(numbers)     #打乱数字的顺序

        correct_answer = numbers.pop()      #弹出一个数字作为正确答案

        prompt = [f"不使用任何工具，不编写任何代码，请找出一个1到{upper_number}之间的整数，且必须满足以下要求："]
        for i in numbers:
            prompt.append(f'这个数不能是：{i}')
        prompt.append('请只输出这个数字，而不要输出其他任何内容')

        messages = [
            {
                "role": "user",
                "content": '\n'.join(prompt)
            }
        ]

        #如果出现异常，5秒后重试
        while True:
            try:
                output = LLM.chat.completions.create(
                    model = LLM.model,
                    temperature = 0.1,
                    messages = messages,
                    max_tokens = 100,
                )
                if output.choices[0].finish_reason == "stop":
                    break
            except Exception as e:
                print(e)
                time.sleep(5)
        
        answer = output.choices[0].message.content

        # 用正则表达式，查找answer中的数字
        result = re.findall(r"\d+", answer)

        if len(result) >= 1 and int(result[-1]) == correct_answer:      #如果找到了数字（如果是多个，则看最后一个），且数字等于正确答案
            score += 1
        else:       #如果没有找到数字，或者找到的数字不等于正确答案，则记录失败的情况
            with open("failed.txt", "a") as f:
                f.write(f"LLM {llm_model}, range: {upper_number}, correct answer: {correct_answer}, current answer: {answer}\n\n\n")
            pass
    
    try:
        return score, output.usage.prompt_tokens, output.usage.completion_tokens
    except:
        print(output)
        return score, None, None

if __name__ == "__main__":
    model_list = {}

    for model in TEST_MODELS:
        if model.startswith("#"):
            continue
        model_list[model] = {"continuous_fail": 0}       #记录连续失败次数

    #结果以CSV格式写入，先写入表头
    with open("result.csv", "w") as f:
        f.write("Numbers")
        for model in model_list:
            f.write(f",{model},In Tokens,Out Tokens,Test Price")
        f.write("\n")

    #开始测试
    for i in range(TEST_START, TEST_STOP + 1, TEST_SKIP):
        print(f"Testing {i} numbers, ", end="")
        for model in model_list:
            if model_list[model]["continuous_fail"] >= MAX_FAIL:
                print(f"{model} Failed for max times, always got -1, ", end="")
                continue

            score, in_tokens, out_tokens = Test(model, i)
            model_list[model]["continuous_fail"] = 0 if score > 0 else model_list[model]["continuous_fail"] + 1     #如果得分大于0，则连续失败次数清零，否则加1
            model_list[model]["score"] = score
            model_list[model]["in_tokens"] = in_tokens
            model_list[model]["out_tokens"] = out_tokens

            print(f"{model}: {score}, ", end="")
        
        print()
        with open("result.csv", "a") as f:
            f.write(f"{i}")
            for model in model_list:
                f.write(f",{model_list[model].get('score', None)},{model_list[model].get('in_tokens', None)},{model_list[model].get('out_tokens', None)},0")
            f.write("\n")
